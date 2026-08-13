import {
  filterFsPerks,
  findFsPerk,
  flattenFsPerks,
  formatFsPerkModifierName,
  formatFsPerkModifierValue,
  formatFsPerkNumber,
  getFsPerkCostToLevel,
  getFsPerkIconUrl,
  getFsPerkLevel,
  getFsPerksRace,
  getFsPerksRaceBackgroundUrl,
  getFsPerksRaceIconUrl,
  isSingleLevelFsPerk,
  matchesFsPerkSearch,
  toAppRace,
} from "../../../src/explorer/fs-perks/fs-perks-helpers";
import type {
  FsPerk,
  FsPerksData,
  FsPerksRace,
} from "../../../src/explorer/fs-perks/fs-perks-types";

const buildPerk = (id: string, overrides: Partial<FsPerk> = {}): FsPerk => ({
  id,
  name: "Reduce Reinforce Cost",
  description: "Reduces the cost to reinforce your squad's fallen members.",
  effect: null,
  icon: "hoff/perks/reinforce_cost_0",
  iconActive: "hoff/perks/reinforce_cost_1",
  tier: 1,
  unlockThreshold: 0,
  maxLevel: 3,
  totalCost: 95,
  levels: [
    { level: 1, cost: 25, cumulativeCost: 25, effect: "12%", modifiers: [] },
    { level: 2, cost: 30, cumulativeCost: 55, effect: "24%", modifiers: [] },
    { level: 3, cost: 40, cumulativeCost: 95, effect: "36%", modifiers: [] },
  ],
  ...overrides,
});

const race: FsPerksRace = {
  id: "americans",
  race: "american",
  name: "US Forces",
  icon: "common/factions/american_mipped",
  backgroundImage: "races/faction_badges_large/american_xl_faction_icon",
  tiers: [
    { tier: 1, unlockThreshold: 0, perks: [buildPerk("hoff_perk_reduce_reinforce_cost_us")] },
    {
      tier: 2,
      unlockThreshold: 3,
      perks: [
        buildPerk("hoff_perk_upgrade_fighter_squad_us", {
          name: "Upgrade Outposts",
          description: "Garrison prebuilt Outposts with specialized soldiers.",
          tier: 2,
          unlockThreshold: 3,
        }),
        buildPerk("hoff_perk_extra_tech_pick_us", {
          name: "Extra Tech Pick",
          description: null,
          maxLevel: 1,
          totalCost: 100,
          levels: [{ level: 1, cost: 100, cumulativeCost: 100, effect: null, modifiers: [] }],
        }),
      ],
    },
  ],
  perkCount: 3,
  levelCount: 7,
  totalCost: 290,
};

describe("toAppRace", () => {
  test("maps the race ids of the game files", () => {
    expect(toAppRace("afrika_korps")).toBe("dak");
    expect(toAppRace("british_africa")).toBe("british");
    expect(toAppRace("americans")).toBe("american");
    expect(toAppRace("germans")).toBe("german");
  });

  test("passes our own races through", () => {
    expect(toAppRace("american")).toBe("american");
    expect(toAppRace("dak")).toBe("dak");
  });

  test("gives null for anything unknown", () => {
    expect(toAppRace("martians")).toBeNull();
    expect(toAppRace(undefined)).toBeNull();
  });
});

describe("getFsPerksRace", () => {
  test("reads a race out of the parsed data", () => {
    const data = { races: { american: race }, raceList: [race], patch: "latest", locale: "en" };

    expect(getFsPerksRace(data as FsPerksData, "american")).toBe(race);
    expect(getFsPerksRace(data as FsPerksData, "german")).toBeNull();
    expect(getFsPerksRace(null, "american")).toBeNull();
  });
});

describe("icon urls", () => {
  test("builds the perk icon urls of both states", () => {
    const perk = buildPerk("hoff_perk_reduce_reinforce_cost_us");

    expect(getFsPerkIconUrl(perk)).toContain("/export/icons/hoff/perks/reinforce_cost_0.webp");
    expect(getFsPerkIconUrl(perk, true)).toContain(
      "/export/icons/hoff/perks/reinforce_cost_1.webp",
    );
  });

  test("builds the faction icon and badge urls", () => {
    expect(getFsPerksRaceIconUrl(race)).toContain(
      "/export/icons/common/factions/american_mipped.webp",
    );
    // The badges are only on the CDN with their path flattened away.
    expect(getFsPerksRaceBackgroundUrl(race)).toContain(
      "/export_flatten/american_xl_faction_icon.webp",
    );
  });
});

describe("perk lookups", () => {
  test("flattens the tree in tier order", () => {
    expect(flattenFsPerks(race).map((perk) => perk.id)).toEqual([
      "hoff_perk_reduce_reinforce_cost_us",
      "hoff_perk_upgrade_fighter_squad_us",
      "hoff_perk_extra_tech_pick_us",
    ]);
    expect(flattenFsPerks(null)).toEqual([]);
  });

  test("finds a perk by its id", () => {
    expect(findFsPerk(race, "hoff_perk_extra_tech_pick_us")?.name).toBe("Extra Tech Pick");
    expect(findFsPerk(race, "nope")).toBeNull();
  });

  test("finds a level of a perk", () => {
    const perk = buildPerk("hoff_perk_reduce_reinforce_cost_us");

    expect(getFsPerkLevel(perk, 2)?.effect).toBe("24%");
    expect(getFsPerkLevel(perk, 9)).toBeNull();
  });
});

describe("getFsPerkCostToLevel", () => {
  test("sums the level costs up to the given level", () => {
    const perk = buildPerk("hoff_perk_reduce_reinforce_cost_us");

    expect(getFsPerkCostToLevel(perk, 0)).toBe(0);
    expect(getFsPerkCostToLevel(perk, 2)).toBe(55);
    expect(getFsPerkCostToLevel(perk, 3)).toBe(perk.totalCost);
    // Asking for more levels than the perk has is the whole perk.
    expect(getFsPerkCostToLevel(perk, 10)).toBe(perk.totalCost);
  });
});

describe("isSingleLevelFsPerk", () => {
  test("tells the unlocks from the levelled perks", () => {
    expect(isSingleLevelFsPerk({ maxLevel: 1 })).toBe(true);
    expect(isSingleLevelFsPerk({ maxLevel: 5 })).toBe(false);
  });
});

describe("filterFsPerks", () => {
  const perks = flattenFsPerks(race);

  test("matches the name, the description and the raw id", () => {
    expect(filterFsPerks(perks, "outposts").map((perk) => perk.id)).toEqual([
      "hoff_perk_upgrade_fighter_squad_us",
    ]);
    expect(filterFsPerks(perks, "reinforce").map((perk) => perk.id)).toEqual([
      "hoff_perk_reduce_reinforce_cost_us",
    ]);
    expect(filterFsPerks(perks, "extra_tech").map((perk) => perk.id)).toEqual([
      "hoff_perk_extra_tech_pick_us",
    ]);
  });

  test("keeps everything for an empty search", () => {
    expect(filterFsPerks(perks, "  ")).toHaveLength(3);
    expect(matchesFsPerkSearch(perks[0], "")).toBe(true);
  });

  test("survives a perk without a description", () => {
    expect(matchesFsPerkSearch(perks[2], "garrison")).toBe(false);
  });
});

describe("formatting", () => {
  test("formats numbers without trailing zeros", () => {
    expect(formatFsPerkNumber(2.5)).toBe("2.5");
    expect(formatFsPerkNumber(1)).toBe("1");
    expect(formatFsPerkNumber(1.20001)).toBe("1.2");
  });

  test("formats modifier values, blueprints included", () => {
    expect(formatFsPerkModifierValue({ id: "AMOUNT", type: "float", value: 1.2 })).toBe("1.2");
    expect(
      formatFsPerkModifierValue({
        id: "ENTITY_PBG_1",
        type: "pbgid",
        value: "ebps/hoff/american/drops/hoff_weapon_drop_perk_crate_1_us",
      }),
    ).toBe("hoff_weapon_drop_perk_crate_1_us");
  });

  test("makes the modifier names readable", () => {
    expect(formatFsPerkModifierName("WEAPON_PENETRATION_MODIFIER")).toBe(
      "Weapon Penetration Modifier",
    );
    expect(formatFsPerkModifierName("AMOUNT")).toBe("Amount");
  });
});
