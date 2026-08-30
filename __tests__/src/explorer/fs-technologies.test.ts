import { parseFsTechnologies } from "../../../src/explorer/fs-technologies/fs-technologies";
import type {
  RawFsTechnologiesFile,
  RawFsTechnology,
} from "../../../src/explorer/fs-technologies/fs-technologies-types";

const buildRawTechnology = (
  id: string,
  overrides: Partial<RawFsTechnology> = {},
): RawFsTechnology => ({
  id,
  path: `upgrade/hoff/afrika_korps/technology/${id}`,
  pbgid: 1,
  source: "faction",
  category: "unit",
  buckets: ["Technology_Unit_Bucket0"],
  tags: [],
  thresholdMin: 0,
  thresholdMax: 9999,
  weight: 100,
  commandCost: 1,
  enabled: true,
  ui: { screenName: "1", icon: "races/afrika_corps/infantry/some_unit" },
  ...overrides,
});

const locstring: Record<string, string | null> = {
  "1": "Assault Grenadier Squad",
  "2": "Very effective at short range.",
  "3": "Infantry",
  "4": "Assault Grens",
  "5": "Deals suppression damage.",
  "6": "Increase infantry armor penetration by %1:.p%.",
  "7": "Increase Infantry Armor Penetration",
  "8": "Select one of the following new unit technologies",
  "9": "Select one of the following new passive technologies",
  "10": "Battlefield Salvage",
  // A text with the escaped line break of the game files.
  "11": "First line\\r\\nSecond line",
};

const rawFile: RawFsTechnologiesFile = {
  meta: {
    choicesPerPick: 3,
    maxSlots: 5,
    maxOfferingCount: 1,
    defaultWeight: 100,
    picks: [
      // Out of order on purpose - the parser sorts the picks.
      {
        pick: 2,
        wave: 1,
        bucket: "TECHNOLOGYBUCKET_PASSIVE",
        category: "passive",
        upgradeTypes: ["Technology_Passive"],
        ignoreThresholds: false,
        fillEmptySlots: false,
        title: "9",
      },
      {
        pick: 1,
        wave: 0,
        bucket: "TECHNOLOGYBUCKET_UNIT_0",
        category: "unit",
        upgradeTypes: ["Technology_Unit_Bucket0"],
        ignoreThresholds: true,
        fillEmptySlots: true,
        title: "8",
      },
      {
        pick: 3,
        wave: 5,
        bucket: "TECHNOLOGYBUCKET_PASSIVE",
        category: "passive",
        upgradeTypes: ["Technology_Passive"],
        ignoreThresholds: false,
        fillEmptySlots: false,
        title: "9",
      },
    ],
  },
  races: {
    afrika_korps: {
      // The `id` of a race entry is its technology list, not a race - the race comes from `race`.
      id: "hoff_technology_list_ak",
      pbgid: 2170629,
      race: "racebps/afrika_korps",
      lists: ["hoff_technology_list_ak", "hoff_technology_list_common"],
      technologies: [
        buildRawTechnology("hoff_technology_unit_assault_panzergrenadier_ak", {
          tags: ["Technology_Infantry"],
          ui: {
            screenName: "1",
            screenNameShort: "4",
            briefText: "2",
            helpText: "3",
            extraText: "5",
            icon: "races/afrika_corps/infantry/assault_panzergrenadier_ak",
          },
          properties: [
            { id: "THRESHOLD_MIN", type: "int", value: 0 },
            { id: "THRESHOLD_MAX", type: "int", value: 9999 },
            {
              id: "SQUAD_PBG_1",
              type: "pbgid",
              value: "sbps/hoff/afrika_korps/infantry/hoff_player_assault_panzergrenadier_ak",
            },
          ],
          squad: "sbps/hoff/afrika_korps/infantry/hoff_player_assault_panzergrenadier_ak",
        }),
        // A passive: no bucket, drafted by category, with a formatter description.
        buildRawTechnology("hoff_technology_passive_increase_infantry_penetration", {
          source: "common",
          category: "passive",
          buckets: [],
          ui: {
            screenName: "7",
            briefTextFormatter: { formatter: "6", arguments: [100] },
            icon: "technology/hoff/common/infantry_armor_penetration",
          },
          properties: [
            { id: "WEAPON_PENETRATION_MODIFIER", type: "float", value: 2 },
            { id: "AUTO_APPLY_MODIFIERS", type: "bool", value: true },
            { id: "THRESHOLD_MIN", type: "int", value: 0 },
          ],
        }),
        // Only offered from wave 4 on, so the passive pick of wave 1 must not have it.
        buildRawTechnology("hoff_technology_passive_late_passive", {
          category: "passive",
          buckets: [],
          thresholdMin: 4,
          ui: { screenName: "10", icon: "technology/hoff/common/late" },
        }),
        // Its wave window lies outside every pick - it is unreachable, not dropped.
        buildRawTechnology("hoff_technology_passive_reduced_upkeep", {
          category: "passive",
          buckets: [],
          thresholdMin: 15,
          ui: { screenName: "10", icon: "technology/hoff/common/upkeep" },
        }),
        // Switched off in the game files - it may not show up in any pick.
        buildRawTechnology("hoff_technology_unit_disabled_ak", {
          enabled: false,
          ui: { screenName: "10", icon: "races/afrika_corps/infantry/disabled" },
        }),
      ],
    },
  },
};

describe("parseFsTechnologies", () => {
  const { races, raceList, meta } = parseFsTechnologies(rawFile, locstring);
  const dak = races.dak!;

  it("maps the race off the race blueprint path, not off the list id", () => {
    expect(raceList).toHaveLength(1);
    expect(dak).toBeDefined();
    expect(dak.race).toBe("dak");
    expect(dak.id).toBe("hoff_technology_list_ak");
  });

  it("parses the draft rules", () => {
    expect(meta).toEqual({
      choicesPerPick: 3,
      maxSlots: 5,
      maxOfferingCount: 1,
      defaultWeight: 100,
    });
  });

  it("localizes the texts of a technology", () => {
    const technology = dak.technologies[0];

    expect(technology.name).toBe("Assault Grenadier Squad");
    expect(technology.shortName).toBe("Assault Grens");
    expect(technology.description).toBe("Very effective at short range.");
    expect(technology.typeLabel).toBe("Infantry");
    expect(technology.extraText).toBe("Deals suppression damage.");
    expect(technology.squad).toBe(
      "sbps/hoff/afrika_korps/infantry/hoff_player_assault_panzergrenadier_ak",
    );
  });

  it("resolves a formatter description", () => {
    const passive = dak.technologies[1];

    expect(passive.description).toBe("Increase infantry armor penetration by 100%.");
  });

  it("does not carry the raw properties over to the frontend", () => {
    expect(dak.technologies[1]).not.toHaveProperty("properties");
  });

  it("derives the unit id of a unit technology from its squad", () => {
    expect(dak.technologies[0].unitId).toBe("hoff_player_assault_panzergrenadier_ak");
    // A passive unlocks no squad.
    expect(dak.technologies[1].unitId).toBeNull();
  });

  it("sorts the picks and localizes their titles", () => {
    expect(dak.picks.map(({ pick }) => pick)).toEqual([1, 2, 3]);
    expect(dak.picks[0].title).toBe("Select one of the following new unit technologies");
  });

  it("offers a technology only in the picks of its bucket", () => {
    expect(dak.picks[0].technologies.map(({ id }) => id)).toEqual([
      "hoff_technology_unit_assault_panzergrenadier_ak",
    ]);
  });

  it("applies the wave thresholds only on the picks which respect them", () => {
    // Wave 1, the late passive starts at wave 4.
    expect(dak.picks[1].technologies.map(({ id }) => id)).toEqual([
      "hoff_technology_passive_increase_infantry_penetration",
    ]);
    // Wave 5, both passives are on the table.
    expect(dak.picks[2].technologies.map(({ id }) => id)).toEqual([
      "hoff_technology_passive_increase_infantry_penetration",
      "hoff_technology_passive_late_passive",
    ]);
  });

  it("marks a technology as new only in the first pick which can offer it", () => {
    expect(dak.picks[1].newTechnologies.map(({ id }) => id)).toEqual([
      "hoff_technology_passive_increase_infantry_penetration",
    ]);
    // The shared passive was already described by pick 2, only the late one is new here.
    expect(dak.picks[2].newTechnologies.map(({ id }) => id)).toEqual([
      "hoff_technology_passive_late_passive",
    ]);
  });

  it("never offers a disabled technology", () => {
    const offered = dak.picks.flatMap(({ technologies }) => technologies.map(({ id }) => id));

    expect(offered).not.toContain("hoff_technology_unit_disabled_ak");
  });

  it("keeps the technologies no pick can offer", () => {
    expect(dak.unreachableTechnologies.map(({ id }) => id)).toEqual([
      "hoff_technology_passive_reduced_upkeep",
      "hoff_technology_unit_disabled_ak",
    ]);
  });

  it("counts the technologies and collects the filter values", () => {
    expect(dak.technologyCount).toBe(5);
    expect(dak.categoryCounts).toEqual({ unit: 2, ability: 0, passive: 3 });
    expect(dak.typeLabels).toEqual(["Infantry"]);
    expect(dak.tags).toEqual(["Technology_Infantry"]);
  });

  it("skips a race it doesn't know", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const { raceList: unknownRaces } = parseFsTechnologies(
      {
        meta: rawFile.meta,
        races: { soviets: { ...rawFile.races.afrika_korps, race: "racebps/soviets" } },
      },
      locstring,
    );

    expect(unknownRaces).toHaveLength(0);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it("turns the escaped line breaks of the locstrings into real ones", () => {
    const { races: parsedRaces } = parseFsTechnologies(
      {
        meta: rawFile.meta,
        races: {
          afrika_korps: {
            ...rawFile.races.afrika_korps,
            technologies: [
              buildRawTechnology("hoff_technology_unit_multiline_ak", {
                ui: { screenName: "1", briefText: "11", icon: "icon" },
              }),
            ],
          },
        },
      },
      locstring,
    );

    expect(parsedRaces.dak!.technologies[0].description).toBe("First line\nSecond line");
  });
});
