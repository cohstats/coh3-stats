import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Badge,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { TFunction } from "next-i18next/pages";
import FactionIcon from "../../../components/faction-icon";
import { FactionSwitch } from "../../../components/faction-switch";
import { localizedNames } from "../../../src/coh3/coh3-data";
import type { raceType } from "../../../src/coh3/coh3-types";
import {
  formatFsTechTag,
  matchesFsTechFilters,
  type FsTechFilters,
} from "../../../src/explorer/fs-technologies/fs-technologies-helpers";
import type {
  FsTechMeta,
  FsTechnologiesRace,
  FsTechnology,
} from "../../../src/explorer/fs-technologies/fs-technologies-types";
import { getExplorerFsTechRoute } from "../../../src/routes";
import TechCard from "./tech-card";
import TechPickSection from "./tech-pick-section";
import classes from "./fs-tech.module.css";

/** Size of the faction icon in the page header. */
const FACTION_ICON_SIZE = 64;

/** Size of the faction icons of the switch. */
const FACTION_SWITCH_SIZE = 30;

/** How long the search box waits before it writes the typed term into the url. */
const SEARCH_URL_DEBOUNCE_MS = 300;

/**
 * The filters of the page together with the faction they were read for.
 *
 * Switching the faction keeps this component mounted, so the state has to say which faction it
 * belongs to - otherwise the filters of the previous faction would be written into the url of the
 * new one before they are reset.
 */
type FsTechFilterState = Required<FsTechFilters> & { race: raceType };

/** Filter state with nothing filtered - the initial state and what the reset button goes back to. */
const emptyFilters = (race: raceType): FsTechFilterState => ({
  race,
  search: "",
  typeLabels: [],
  tags: [],
  includeCommon: true,
});

/**
 * Reads a comma separated list out of the url, dropping every value the faction doesn't offer - a
 * link built for another faction shouldn't be able to filter the whole page away.
 */
const parseListQuery = (value: string | string[] | undefined, allowed: string[]): string[] => {
  const raw = Array.isArray(value) ? value : (value?.split(",") ?? []);

  return raw.map((entry) => entry.trim()).filter((entry) => allowed.includes(entry));
};

/** A pick with its pool already filtered and split into the cards and the chips of the section. */
type RenderedPick = {
  pick: FsTechnologiesRace["picks"][number];
  newTechnologies: FsTechnology[];
  repeatedTechnologies: FsTechnology[];
};

/**
 * Applies the filters to the draft and works out, per pick, which technologies are rendered as full
 * cards and which as chips.
 *
 * The split cannot be taken from the parsed data, because a filter can hide the pick which would
 * have described a technology first - the first pick which still shows it has to take over the card.
 */
const renderPicks = (race: FsTechnologiesRace, filters: FsTechFilters): RenderedPick[] => {
  const described = new Set<string>();

  return race.picks.map((pick) => {
    const technologies = pick.technologies.filter((technology) =>
      matchesFsTechFilters(technology, filters),
    );

    const newTechnologies = technologies.filter(({ id }) => !described.has(id));
    newTechnologies.forEach(({ id }) => described.add(id));

    return {
      pick,
      newTechnologies,
      repeatedTechnologies: technologies.filter(
        ({ id }) => !newTechnologies.some((n) => n.id === id),
      ),
    };
  });
};

/** The search box and the filter chips above the draft. */
const TechFilters = ({
  race,
  search,
  onSearchChange,
  typeLabels,
  onTypeLabelsChange,
  tags,
  onTagsChange,
  includeCommon,
  onIncludeCommonChange,
  onReset,
  hasFilters,
  t,
}: {
  race: FsTechnologiesRace;
  search: string;
  onSearchChange: (value: string) => void;
  typeLabels: string[];
  onTypeLabelsChange: (value: string[]) => void;
  tags: string[];
  onTagsChange: (value: string[]) => void;
  includeCommon: boolean;
  onIncludeCommonChange: (value: boolean) => void;
  onReset: () => void;
  hasFilters: boolean;
  t: TFunction;
}) => (
  <Card withBorder padding="sm" radius="md">
    <Stack gap="xs">
      <Group gap="xs" justify="space-between" wrap="wrap">
        <TextInput
          placeholder={t("filters.searchPlaceholder")}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          style={{ flex: "1 1 260px" }}
          data-testid="fs-tech-search"
        />

        <Group gap="xs">
          <Tooltip label={t("filters.commonTooltip")} withArrow>
            <Chip
              checked={includeCommon}
              onChange={onIncludeCommonChange}
              size="sm"
              variant="light"
              data-testid="fs-tech-filter-common"
            >
              {t("filters.common")}
            </Chip>
          </Tooltip>

          {hasFilters && (
            <Button variant="subtle" size="compact-sm" onClick={onReset}>
              {t("filters.reset")}
            </Button>
          )}
        </Group>
      </Group>

      <Stack gap={4}>
        <Text size="xs" c="dimmed">
          {t("filters.type")}
        </Text>
        <Chip.Group multiple value={typeLabels} onChange={onTypeLabelsChange}>
          <Group gap={4}>
            {race.typeLabels.map((typeLabel) => (
              <Chip key={typeLabel} value={typeLabel} size="xs" variant="outline">
                {typeLabel}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>

      {race.tags.length > 0 && (
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            {t("filters.tags")}
          </Text>
          <Chip.Group multiple value={tags} onChange={onTagsChange}>
            <Group gap={4}>
              {race.tags.map((tag) => (
                <Chip key={tag} value={tag} size="xs" variant="outline">
                  {formatFsTechTag(tag)}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Stack>
      )}
    </Stack>
  </Card>
);

/**
 * The Final Stand technology draft of a single faction - one section per pick, in the order the game
 * offers them.
 *
 * A technology is described in full in the first pick which can offer it and comes back as a chip in
 * the later picks which share it. Without that the four passive picks, which draw from almost the
 * same pool, would repeat the same twenty cards four times over.
 */
const FsTechPage = ({
  race,
  availableRaces,
  meta,
  t,
}: {
  race: FsTechnologiesRace;
  availableRaces: raceType[];
  meta: FsTechMeta;
  t: TFunction;
}) => {
  const router = useRouter();
  const [filterState, setFilterState] = useState<FsTechFilterState>(() =>
    emptyFilters(race.race),
  );

  const { search, typeLabels, tags, includeCommon } = filterState;
  const filters: FsTechFilters = { search, typeLabels, tags, includeCommon };
  const hasFilters = !!search || typeLabels.length > 0 || tags.length > 0 || !includeCommon;

  const updateFilters = useCallback(
    (update: Partial<FsTechFilterState>) =>
      setFilterState((previous) => ({ ...previous, ...update })),
    [],
  );

  const resetFilters = useCallback(() => setFilterState(emptyFilters(race.race)), [race.race]);

  // The page is statically generated, so the query is only known after hydration. A faction switch
  // leaves this component mounted with an empty query, which resets the filters here as well.
  useEffect(() => {
    if (!router.isReady) return;

    const { search: searchQuery, type, tag, common } = router.query;

    setFilterState({
      race: race.race,
      search: typeof searchQuery === "string" ? searchQuery : "",
      typeLabels: parseListQuery(type, race.typeLabels),
      tags: parseListQuery(tag, race.tags),
      includeCommon: common !== "false",
    });
  }, [router.isReady, race.race]);

  // The search filters as you type, but only lands in the url once the typing stops - one history
  // entry per keystroke would be useless and a `replace` per keystroke is just noise.
  const [debouncedSearch] = useDebouncedValue(search, SEARCH_URL_DEBOUNCE_MS);

  // Keep the url in sync with the filters, so a filtered page can be shared as a link. Skipped
  // until the effect above has read the filters of the faction which is currently rendered.
  useEffect(() => {
    // Nothing is written while the debounce is still catching up with the search box - that keeps
    // the half typed terms out of the url and the term of a shared link in it.
    if (!router.isReady || filterState.race !== race.race || debouncedSearch !== search) return;

    const query: Record<string, string> = { raceId: race.race };
    if (debouncedSearch.trim()) query.search = debouncedSearch.trim();
    if (typeLabels.length > 0) query.type = typeLabels.join(",");
    if (tags.length > 0) query.tag = tags.join(",");
    if (!includeCommon) query.common = "false";

    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
  }, [
    router.isReady,
    filterState.race,
    race.race,
    search,
    debouncedSearch,
    typeLabels,
    tags,
    includeCommon,
  ]);

  const picks = useMemo(
    () => renderPicks(race, filters),
    [race, search, typeLabels, tags, includeCommon],
  );

  const unreachable = useMemo(
    () =>
      race.unreachableTechnologies.filter((technology) =>
        matchesFsTechFilters(technology, filters),
      ),
    [race, search, typeLabels, tags, includeCommon],
  );

  const matchCount = new Set([
    ...picks.flatMap(({ newTechnologies }) => newTechnologies.map(({ id }) => id)),
    ...unreachable.map(({ id }) => id),
  ]).size;

  return (
    <Container size="lg" p={0}>
      <Stack gap="lg">
        {/* The switch sits in the top right corner and drops below the title once space runs out. */}
        <Group gap="md" align="flex-start" justify="space-between">
          <Group gap="md" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
            <FactionIcon name={race.race} width={FACTION_ICON_SIZE} />

            <Stack gap={6} style={{ minWidth: 0 }}>
              <Title order={1} size="h2">
                {t("page.title", { faction: race.name })}
              </Title>
              <Text c="dimmed">
                {t("page.subtitle", { choices: meta.choicesPerPick, slots: meta.maxSlots })}
              </Text>

              <Group gap={6}>
                <Badge variant="light" color="gray">
                  {t("summary.technologies", { count: race.technologyCount })}
                </Badge>
                <Badge variant="light" color="blue">
                  {t("summary.units", { count: race.categoryCounts.unit })}
                </Badge>
                <Badge variant="light" color="grape">
                  {t("summary.abilities", { count: race.categoryCounts.ability })}
                </Badge>
                <Badge variant="light" color="teal">
                  {t("summary.passives", { count: race.categoryCounts.passive })}
                </Badge>
                <Tooltip label={t("summary.slotsTooltip")} multiline w={260} withArrow>
                  <Badge variant="light" color="orange">
                    {t("summary.slots", { count: meta.maxSlots })}
                  </Badge>
                </Tooltip>
              </Group>
            </Stack>
          </Group>

          <FactionSwitch
            races={availableRaces}
            activeRace={race.race}
            getHref={getExplorerFsTechRoute}
            getTooltipLabel={(r) => t("faction.switchTooltip", { faction: localizedNames[r] })}
            iconSize={FACTION_SWITCH_SIZE}
            testIdPrefix="fs-tech-faction-"
          />
        </Group>

        <TechFilters
          race={race}
          search={search}
          onSearchChange={(value) => updateFilters({ search: value })}
          typeLabels={typeLabels}
          onTypeLabelsChange={(value) => updateFilters({ typeLabels: value })}
          tags={tags}
          onTagsChange={(value) => updateFilters({ tags: value })}
          includeCommon={includeCommon}
          onIncludeCommonChange={(value) => updateFilters({ includeCommon: value })}
          onReset={resetFilters}
          hasFilters={hasFilters}
          t={t}
        />

        {hasFilters && (
          <Text size="sm" c="dimmed" data-testid="fs-tech-match-count">
            {t("filters.matches", { count: matchCount })}
          </Text>
        )}

        <Stack gap="xl">
          {picks.map(({ pick, newTechnologies, repeatedTechnologies }) => {
            // A pick which the filters emptied out is dropped - an empty section per pick would
            // bury the few results a narrow search leaves behind.
            if (hasFilters && newTechnologies.length === 0 && repeatedTechnologies.length === 0) {
              return null;
            }

            return (
              <TechPickSection
                key={pick.pick}
                pick={pick}
                newTechnologies={newTechnologies}
                repeatedTechnologies={repeatedTechnologies}
                choicesPerPick={meta.choicesPerPick}
                race={race.race}
                t={t}
              />
            );
          })}
        </Stack>

        {/*
         * Technologies the draft cannot reach - their wave window lies outside the twelve picks.
         * They are in the game files, so they are shown rather than dropped.
         */}
        {unreachable.length > 0 && (
          <>
            <Divider />
            <Stack gap="xs">
              <Group gap="xs" align="baseline">
                <Title order={2} size="h4">
                  {t("unreachable.title")}
                </Title>
                <Badge variant="light" color="gray">
                  {unreachable.length}
                </Badge>
              </Group>
              <Text c="dimmed" size="sm">
                {t("unreachable.subtitle")}
              </Text>
              <div className={classes.techGrid}>
                {unreachable.map((technology) => (
                  <TechCard key={technology.id} technology={technology} race={race.race} t={t} />
                ))}
              </div>
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default FsTechPage;
