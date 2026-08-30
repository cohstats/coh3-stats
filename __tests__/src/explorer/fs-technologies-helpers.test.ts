import {
  canFsTechBeOfferedInPick,
  filterFsTechnologies,
  findFsTechnology,
  formatFsTechTag,
  getFsTechIconUrl,
  getFsTechUnitId,
  getFsTechUnitRoute,
  getFsTechnologiesRace,
  isFsTechAlwaysAvailable,
  matchesFsTechFilters,
  matchesFsTechSearch,
  toAppRaceFromTechRace,
} from "../../../src/explorer/fs-technologies/fs-technologies-helpers";
import type {
  FsTechnologiesData,
  FsTechnologiesRace,
  FsTechnology,
} from "../../../src/explorer/fs-technologies/fs-technologies-types";

const buildTechnology = (id: string, overrides: Partial<FsTechnology> = {}): FsTechnology => ({
  id,
  name: "Assault Grenadier Squad",
  shortName: null,
  description: "Very effective against infantry at short-range.",
  typeLabel: "Infantry",
  extraText: null,
  icon: "races/afrika_corps/infantry/assault_panzergrenadier_ak",
  category: "unit",
  source: "faction",
  buckets: ["Technology_Unit_Bucket0"],
  tags: ["Technology_Infantry"],
  thresholdMin: 0,
  thresholdMax: 9999,
  alwaysAvailable: true,
  weight: 100,
  commandCost: 1,
  enabled: true,
  squad: null,
  ability: null,
  upgrade: null,
  unitId: null,
  ...overrides,
});

describe("toAppRaceFromTechRace", () => {
  it("maps a race blueprint path", () => {
    expect(toAppRaceFromTechRace("racebps/afrika_korps")).toBe("dak");
    expect(toAppRaceFromTechRace("racebps/british_africa")).toBe("british");
  });

  it("maps a bare game race name and passes our own ids through", () => {
    expect(toAppRaceFromTechRace("americans")).toBe("american");
    expect(toAppRaceFromTechRace("german")).toBe("german");
    expect(toAppRaceFromTechRace("dak")).toBe("dak");
  });

  it("gives null for anything unknown", () => {
    expect(toAppRaceFromTechRace("racebps/soviets")).toBeNull();
    expect(toAppRaceFromTechRace("")).toBeNull();
    expect(toAppRaceFromTechRace(null)).toBeNull();
  });
});

describe("getFsTechnologiesRace", () => {
  const race = { race: "dak" } as FsTechnologiesRace;
  const data = { races: { dak: race } } as FsTechnologiesData;

  it("reads a race and tolerates missing data", () => {
    expect(getFsTechnologiesRace(data, "dak")).toBe(race);
    expect(getFsTechnologiesRace(data, "german")).toBeNull();
    expect(getFsTechnologiesRace(null, "dak")).toBeNull();
  });
});

describe("getFsTechIconUrl", () => {
  it("builds the CDN url of an icon", () => {
    expect(getFsTechIconUrl(buildTechnology("a"))).toBe(
      "https://cdn.coh3stats.com/export/icons/races/afrika_corps/infantry/assault_panzergrenadier_ak.webp",
    );
  });
});

describe("findFsTechnology", () => {
  const race = {
    technologies: [buildTechnology("a"), buildTechnology("b")],
  } as FsTechnologiesRace;

  it("finds a technology by its id", () => {
    expect(findFsTechnology(race, "b")?.id).toBe("b");
    expect(findFsTechnology(race, "nope")).toBeNull();
    expect(findFsTechnology(null, "a")).toBeNull();
  });
});

describe("isFsTechAlwaysAvailable", () => {
  it("is true only without a wave window", () => {
    expect(isFsTechAlwaysAvailable({ thresholdMin: 0, thresholdMax: 9999 })).toBe(true);
    expect(isFsTechAlwaysAvailable({ thresholdMin: 4, thresholdMax: 9999 })).toBe(false);
    expect(isFsTechAlwaysAvailable({ thresholdMin: 0, thresholdMax: 10 })).toBe(false);
  });
});

describe("canFsTechBeOfferedInPick", () => {
  const unitPick = {
    category: "unit" as const,
    upgradeTypes: ["Technology_Unit_Bucket0"],
    ignoreThresholds: true,
    wave: 0,
  };
  const passivePick = {
    category: "passive" as const,
    upgradeTypes: ["Technology_Passive"],
    ignoreThresholds: false,
    wave: 1,
  };

  const unit = {
    buckets: ["Technology_Unit_Bucket0"],
    category: "unit" as const,
    enabled: true,
    thresholdMin: 0,
    thresholdMax: 9999,
  };

  it("matches a technology by its bucket", () => {
    expect(canFsTechBeOfferedInPick(unit, unitPick)).toBe(true);
    expect(
      canFsTechBeOfferedInPick({ ...unit, buckets: ["Technology_Unit_Bucket1"] }, unitPick),
    ).toBe(false);
  });

  it("matches a bucketless technology by its category", () => {
    const passive = { ...unit, buckets: [], category: "passive" as const };

    expect(canFsTechBeOfferedInPick(passive, passivePick)).toBe(true);
    expect(canFsTechBeOfferedInPick(passive, unitPick)).toBe(false);
  });

  it("treats a technology without a category as a passive", () => {
    const noCategory = { ...unit, buckets: [], category: null };

    expect(canFsTechBeOfferedInPick(noCategory, passivePick)).toBe(true);
  });

  it("applies the wave thresholds only when the pick respects them", () => {
    const late = { ...unit, buckets: [], category: "passive" as const, thresholdMin: 4 };

    expect(canFsTechBeOfferedInPick(late, passivePick)).toBe(false);
    expect(canFsTechBeOfferedInPick(late, { ...passivePick, wave: 4 })).toBe(true);
    // The unit and ability picks ignore the window.
    expect(canFsTechBeOfferedInPick({ ...unit, thresholdMin: 4 }, unitPick)).toBe(true);
  });

  it("never offers a disabled technology", () => {
    expect(canFsTechBeOfferedInPick({ ...unit, enabled: false }, unitPick)).toBe(false);
  });
});

describe("matchesFsTechSearch", () => {
  const technology = buildTechnology("hoff_technology_unit_assault_panzergrenadier_ak", {
    shortName: "Assault Grens",
  });

  it("matches name, short name, description, type label and id", () => {
    expect(matchesFsTechSearch(technology, "grenadier")).toBe(true);
    expect(matchesFsTechSearch(technology, "assault grens")).toBe(true);
    expect(matchesFsTechSearch(technology, "short-range")).toBe(true);
    expect(matchesFsTechSearch(technology, "infantry")).toBe(true);
    expect(matchesFsTechSearch(technology, "hoff_technology_unit")).toBe(true);
    expect(matchesFsTechSearch(technology, "panther")).toBe(false);
  });

  it("keeps everything for an empty term", () => {
    expect(matchesFsTechSearch(technology, "   ")).toBe(true);
  });
});

describe("matchesFsTechFilters", () => {
  const faction = buildTechnology("faction");
  const common = buildTechnology("common", {
    source: "common",
    typeLabel: "Offensive Passive",
    tags: [],
  });

  it("keeps everything without filters", () => {
    expect(matchesFsTechFilters(faction)).toBe(true);
    expect(matchesFsTechFilters(common)).toBe(true);
  });

  it("can hide the shared technologies", () => {
    expect(matchesFsTechFilters(common, { includeCommon: false })).toBe(false);
    expect(matchesFsTechFilters(faction, { includeCommon: false })).toBe(true);
  });

  it("filters by type label and tag", () => {
    expect(matchesFsTechFilters(faction, { typeLabels: ["Infantry"] })).toBe(true);
    expect(matchesFsTechFilters(common, { typeLabels: ["Infantry"] })).toBe(false);
    expect(matchesFsTechFilters(faction, { tags: ["Technology_Infantry"] })).toBe(true);
    expect(matchesFsTechFilters(common, { tags: ["Technology_Infantry"] })).toBe(false);
  });

  it("combines the filters", () => {
    expect(matchesFsTechFilters(faction, { search: "grenadier", typeLabels: ["Infantry"] })).toBe(
      true,
    );
    expect(matchesFsTechFilters(faction, { search: "panther", typeLabels: ["Infantry"] })).toBe(
      false,
    );
  });
});

describe("filterFsTechnologies", () => {
  it("filters a list", () => {
    const technologies = [
      buildTechnology("a"),
      buildTechnology("b", { source: "common", name: "Fuel Focus" }),
    ];

    expect(filterFsTechnologies(technologies, { includeCommon: false })).toHaveLength(1);
    expect(filterFsTechnologies(technologies, { search: "fuel" }).map(({ id }) => id)).toEqual([
      "b",
    ]);
  });
});

describe("getFsTechUnitId", () => {
  it("takes the squad id off the blueprint path", () => {
    expect(
      getFsTechUnitId("sbps/hoff/american/team_weapons/hoff_player_hmg_30cal_paradrop_us"),
    ).toBe("hoff_player_hmg_30cal_paradrop_us");
  });

  it("gives null for a technology which unlocks no squad", () => {
    expect(getFsTechUnitId(null)).toBeNull();
    expect(getFsTechUnitId(undefined)).toBeNull();
    expect(getFsTechUnitId("")).toBeNull();
  });
});

describe("getFsTechUnitRoute", () => {
  it("links a unit technology to its unit page", () => {
    expect(getFsTechUnitRoute({ unitId: "hoff_player_hmg_30cal_paradrop_us" }, "american")).toBe(
      "/explorer/races/american/units/hoff_player_hmg_30cal_paradrop_us",
    );
    expect(getFsTechUnitRoute({ unitId: "hoff_player_bersaglieri_ak" }, "dak")).toBe(
      "/explorer/races/dak/units/hoff_player_bersaglieri_ak",
    );
  });

  it("gives null for a technology which unlocks no unit", () => {
    expect(getFsTechUnitRoute({ unitId: null }, "german")).toBeNull();
  });
});

describe("formatting", () => {
  it("makes a tag readable", () => {
    expect(formatFsTechTag("Technology_AntiTank")).toBe("Anti Tank");
    expect(formatFsTechTag("Technology_Tank")).toBe("Tank");
    expect(formatFsTechTag("Technology_TeamWeapon")).toBe("Team Weapon");
  });
});
