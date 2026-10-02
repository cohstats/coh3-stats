import sortBy from "lodash/sortBy";
import { ProcessedCOHPlayerStats } from "../coh3/coh3-types";

export type NemesisRecord = ProcessedCOHPlayerStats["nemesis"][number];

export type NemesisSortDirection = "asc" | "desc";

// Used for players without a country, matches the fallback flag in CountryFlag
export const UNKNOWN_COUNTRY = "xx";

export const NEMESIS_SORT_VALUE: Record<string, (record: NemesisRecord) => string | number> = {
  alias: ({ alias }) => (alias || "").toLowerCase(),
  w: ({ w }) => w,
  l: ({ l }) => l,
  diff: ({ w, l }) => w - l,
  wl: ({ w, l }) => (w + l > 0 ? w / (w + l) : 0),
  total: ({ w, l }) => w + l,
  lastmatchdate: ({ lm }) => lm || 0,
};

export const getNemesisCountry = ({ c }: Pick<NemesisRecord, "c">): string =>
  c?.toLowerCase() || UNKNOWN_COUNTRY;

/**
 * Filters the nemesis records to a single country (or keeps all of them when the country is
 * null) and sorts them by one of the nemesis table columns.
 */
export const filterAndSortNemesis = (
  records: NemesisRecord[],
  {
    columnAccessor,
    direction,
    country = null,
  }: { columnAccessor: string; direction: NemesisSortDirection; country?: string | null },
): NemesisRecord[] => {
  const filtered = country
    ? records.filter((record) => getNemesisCountry(record) === country)
    : records;
  const sorted = sortBy(filtered, NEMESIS_SORT_VALUE[columnAccessor] || NEMESIS_SORT_VALUE.total);
  return direction === "desc" ? sorted.reverse() : sorted;
};

export type NemesisCountMode = "players" | "games";

export interface NemesisCountrySummary {
  country: string;
  players: number;
  games: number;
  wins: number;
  losses: number;
}

/**
 * Groups the nemesis records by country, sorted by the selected count (most first). Ties are
 * broken by the number of games played.
 */
export const summarizeNemesisCountries = (
  records: NemesisRecord[],
  mode: NemesisCountMode = "players",
): NemesisCountrySummary[] => {
  const byCountry: Record<string, NemesisCountrySummary> = {};
  for (const record of records) {
    const country = getNemesisCountry(record);
    byCountry[country] ??= { country, players: 0, games: 0, wins: 0, losses: 0 };
    byCountry[country].players++;
    byCountry[country].games += record.w + record.l;
    byCountry[country].wins += record.w;
    byCountry[country].losses += record.l;
  }
  return Object.values(byCountry).sort((a, b) => b[mode] - a[mode] || b.games - a.games);
};
