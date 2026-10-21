import React from "react";
import { useRouter } from "next/router";
import { ActionIcon, Group, Select } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { getLadderTournamentRoute } from "../../../src/routes";
import classes from "./ladder-tournament.module.css";

// Above this the select gets the search, so a long list of seasons stays usable
const SEARCHABLE_FROM = 10;

/**
 * Previous / next buttons around a select with all the seasons. Scales to any number of seasons.
 * Not rendered when there is only one season.
 * @param seasonIds All the seasons sorted from the newest
 */
const SeasonPicker = ({ seasonId, seasonIds }: { seasonId: number; seasonIds: number[] }) => {
  const { t } = useTranslation("tournaments");
  const router = useRouter();

  if (seasonIds.length <= 1) return null;

  const index = seasonIds.indexOf(seasonId);
  // Sorted from the newest - the previous (older) season is after the current one
  const previousSeasonId = index >= 0 ? seasonIds[index + 1] : undefined;
  const nextSeasonId = index > 0 ? seasonIds[index - 1] : undefined;

  const goToSeason = (id: number | undefined) => {
    if (id === undefined || id === seasonId) return;
    router.push(getLadderTournamentRoute(id));
  };

  return (
    <Group gap={6} wrap="nowrap" data-testid="ladder-season-picker">
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
        data={seasonIds.map((id) => ({
          value: `${id}`,
          label: t("league.season", { season: id }),
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
  );
};

export default SeasonPicker;
