import {
  filterAndSortNemesis,
  getNemesisCountry,
  NemesisRecord,
  summarizeNemesisCountries,
  UNKNOWN_COUNTRY,
} from "../../../src/players/nemesis";

const records: NemesisRecord[] = [
  { profile_id: "1", alias: "bravo", w: 10, l: 2, c: "cz", lm: 300 },
  { profile_id: "2", alias: "Alpha", w: 1, l: 9, c: "DE", lm: 100 },
  { profile_id: "3", alias: "charlie", w: 4, l: 4, c: "cz" },
  { profile_id: "4", alias: "delta", w: 3, l: 0, lm: 200 },
];

const ids = (list: NemesisRecord[]) => list.map(({ profile_id }) => profile_id);

describe("getNemesisCountry", () => {
  it("lowercases the country code", () => {
    expect(getNemesisCountry({ c: "DE" })).toBe("de");
  });

  it("falls back to the unknown country", () => {
    expect(getNemesisCountry({ c: undefined })).toBe(UNKNOWN_COUNTRY);
    expect(getNemesisCountry({ c: "" })).toBe(UNKNOWN_COUNTRY);
  });
});

describe("filterAndSortNemesis", () => {
  it.each([
    ["alias", "asc", ["2", "1", "3", "4"]],
    ["alias", "desc", ["4", "3", "1", "2"]],
    ["w", "desc", ["1", "3", "4", "2"]],
    ["l", "asc", ["4", "1", "3", "2"]],
    ["diff", "desc", ["1", "4", "3", "2"]],
    ["wl", "desc", ["4", "1", "3", "2"]],
    ["total", "desc", ["1", "2", "3", "4"]],
    ["lastmatchdate", "desc", ["1", "4", "2", "3"]],
  ] as const)("sorts by %s %s", (columnAccessor, direction, expected) => {
    expect(ids(filterAndSortNemesis(records, { columnAccessor, direction }))).toEqual(expected);
  });

  it("falls back to sorting by total for unknown columns", () => {
    expect(
      ids(filterAndSortNemesis(records, { columnAccessor: "unknown", direction: "desc" })),
    ).toEqual(["1", "2", "3", "4"]);
  });

  it("filters by country before sorting", () => {
    expect(
      ids(
        filterAndSortNemesis(records, { columnAccessor: "w", direction: "asc", country: "cz" }),
      ),
    ).toEqual(["3", "1"]);
  });

  it("matches country codes case-insensitively", () => {
    expect(
      ids(
        filterAndSortNemesis(records, {
          columnAccessor: "total",
          direction: "desc",
          country: "de",
        }),
      ),
    ).toEqual(["2"]);
  });

  it("filters players without a country by the unknown country", () => {
    expect(
      ids(
        filterAndSortNemesis(records, {
          columnAccessor: "total",
          direction: "desc",
          country: UNKNOWN_COUNTRY,
        }),
      ),
    ).toEqual(["4"]);
  });

  it("does not mutate the input", () => {
    const input = [...records];
    filterAndSortNemesis(input, { columnAccessor: "alias", direction: "desc" });
    expect(input).toEqual(records);
  });
});

describe("summarizeNemesisCountries", () => {
  it("counts players, games, wins and losses per country", () => {
    expect(summarizeNemesisCountries(records)).toEqual([
      { country: "cz", players: 2, games: 20, wins: 14, losses: 6 },
      { country: "de", players: 1, games: 10, wins: 1, losses: 9 },
      { country: UNKNOWN_COUNTRY, players: 1, games: 3, wins: 3, losses: 0 },
    ]);
  });

  it("sorts by games when in games mode", () => {
    const moreGamesFromOnePlayer: NemesisRecord[] = [
      ...records,
      { profile_id: "5", alias: "echo", w: 30, l: 20, c: "us" },
    ];
    expect(
      summarizeNemesisCountries(moreGamesFromOnePlayer, "games").map(({ country }) => country),
    ).toEqual(["us", "cz", "de", UNKNOWN_COUNTRY]);
  });

  it("returns an empty list without records", () => {
    expect(summarizeNemesisCountries([])).toEqual([]);
  });
});
