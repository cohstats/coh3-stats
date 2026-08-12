import {
  parseFsPerks,
  resolveFsPerkFormatter,
  resolveFsPerkLocstring,
  resolveFsPerkText,
  unescapeFsPerkText,
} from "../../../src/explorer/fs-perks/fs-perks";
import type { RawFsPerksFile } from "../../../src/explorer/fs-perks/fs-perks-types";

const rawFile = {
  races: {
    american: {
      id: "americans",
      pbgid: 2171925,
      race: "racebps/americans",
      perkPool: "hoff",
      perkPointsPool: "hoff_points_american",
      ui: {
        name: "11152673",
        icon: "common/factions/american_mipped",
        backgroundImage: "races/faction_badges_large/american_xl_faction_icon",
      },
      tiers: [
        // Out of order on purpose - the parser sorts the tiers.
        {
          tier: 2,
          unlockThreshold: 3,
          perks: [
            {
              id: "hoff_perk_upgrade_fighter_squad_us",
              path: "perks/persistent_perk/hoff/american/hoff_perk_upgrade_fighter_squad_us",
              pbgid: 2173097,
              playerUpgrade: "upgrade/hoff/american/perks/hoff_perk_upgrade_fighter_squad_us",
              ui: {
                screenName: "11273585",
                briefText: "11273586",
                icon: "hoff/perks/upgrade_outposts_0",
                iconAlternate: "hoff/perks/upgrade_outposts_1",
              },
              maxLevel: 2,
              totalCost: 115,
              // Unlock perks have no modifiers, their levels only carry a plain help text.
              levels: [
                { level: 1, cost: 50, ui: { helpText: "11273600" } },
                { level: 2, cost: 65, ui: { helpText: "11273601" } },
              ],
            },
          ],
        },
        {
          tier: 1,
          unlockThreshold: 0,
          perks: [
            {
              id: "hoff_perk_reduce_reinforce_cost_us",
              path: "perks/persistent_perk/hoff/american/hoff_perk_reduce_reinforce_cost_us",
              pbgid: 2172258,
              playerUpgrade: "upgrade/hoff/american/perks/hoff_perk_reduce_reinforce_cost_us",
              ui: {
                screenName: "11272957",
                // No plain description, only a formatter one.
                briefTextFormatter: { formatter: "11317082", arguments: [] },
                helpTextFormatter: { formatter: "11273224", arguments: [2.5] },
                icon: "hoff/perks/reinforce_cost_0",
                iconAlternate: "hoff/perks/reinforce_cost_1",
              },
              maxLevel: 2,
              totalCost: 55,
              levels: [
                {
                  level: 1,
                  cost: 25,
                  modifiers: [{ id: "REINFORCE_COST_MODIFIER", type: "float", value: 0.88 }],
                  ui: { helpTextFormatter: { formatter: "11273227", arguments: [12] } },
                },
                {
                  level: 2,
                  cost: 30,
                  modifiers: [{ id: "REINFORCE_COST_MODIFIER", type: "float", value: 0.76 }],
                  ui: { helpTextFormatter: { formatter: "11273227", arguments: [24] } },
                },
              ],
            },
          ],
        },
      ],
    },
    // The data file spells the factions the way the game files do.
    afrika_korps: {
      id: "afrika_korps",
      pbgid: 2172240,
      race: "racebps/afrika_korps",
      perkPool: "hoff",
      perkPointsPool: "hoff_points_afrika_korps",
      ui: {
        name: "11181964",
        icon: "common/factions/afrika_korps_mipped",
        backgroundImage: "races/faction_badges_large/dak_xl_faction_icon",
      },
      tiers: [
        {
          tier: 1,
          unlockThreshold: 0,
          perks: [
            {
              id: "hoff_perk_salvage_dak",
              path: "perks/persistent_perk/hoff/afrika_korps/hoff_perk_salvage_dak",
              pbgid: 2171626,
              playerUpgrade: "upgrade/hoff/afrika_korps/perks/hoff_perk_salvage_dak",
              ui: {
                // Missing locstring on purpose - the name falls back to the perk id.
                screenName: "999999",
                briefText: "11274832",
                icon: "hoff/perks/salvage_0",
                iconAlternate: "hoff/perks/salvage_1",
              },
              maxLevel: 1,
              totalCost: 100,
              levels: [
                {
                  level: 1,
                  cost: 100,
                  modifiers: [
                    { id: "AMOUNT_MUNITIONS", type: "int", value: 1 },
                    {
                      id: "ENTITY_PBG_1",
                      type: "pbgid",
                      value: "ebps/hoff/american/drops/hoff_weapon_drop_perk_crate_1_us",
                    },
                  ],
                  ui: {
                    helpTextFormatter: { formatter: "11273408", arguments: [1, "11152057"] },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
} as unknown as RawFsPerksFile;

const locstring: Record<string, string | null> = {
  "11152673": "US Forces",
  "11181964": "Afrikakorps",
  "11272957": "Reduce Reinforce Cost",
  "11273585": "Upgrade Outposts",
  "11273586": "Garrison prebuilt Outposts.\\r\\n• Officer — Grants Manpower",
  "11273600": "Officer",
  "11273601": "HMG",
  "11274832": "Salvage wrecks for resources.",
  "11317082": "Reduces the cost to reinforce your squad's fallen members.",
  // Percent formatter - the argument is already a percentage.
  "11273227": "%1:.p%",
  "11273224": "%1%/s",
  "11273408": "+%1% %2%",
  "11152057": "Munitions",
  // 999999 is missing on purpose.
};

describe("parseFsPerks", () => {
  test("keys the races by our own race names and lists them in app order", () => {
    const { races, raceList } = parseFsPerks(rawFile, locstring);

    expect(Object.keys(races).sort()).toEqual(["american", "dak"]);
    expect(races["american"]?.id).toBe("americans");
    expect(races["dak"]?.id).toBe("afrika_korps");
    // raceTypeArray order is german, american, dak, british.
    expect(raceList.map((race) => race.race)).toEqual(["american", "dak"]);
  });

  test("resolves the faction name and keeps the icon paths", () => {
    const { races } = parseFsPerks(rawFile, locstring);
    const race = races["american"];

    expect(race?.name).toBe("US Forces");
    expect(race?.icon).toBe("common/factions/american_mipped");
    expect(race?.backgroundImage).toBe("races/faction_badges_large/american_xl_faction_icon");
  });

  test("falls back to our own faction name when the locstring is missing", () => {
    const { races } = parseFsPerks(rawFile, { ...locstring, "11181964": null });

    expect(races["dak"]?.name).toBe("Deutsches Afrikakorps");
  });

  test("sorts the tiers and carries the tier info over to the perks", () => {
    const { races } = parseFsPerks(rawFile, locstring);
    const race = races["american"];

    expect(race?.tiers.map((tier) => tier.tier)).toEqual([1, 2]);
    expect(race?.tiers.map((tier) => tier.unlockThreshold)).toEqual([0, 3]);

    const perk = race?.tiers[1].perks[0];
    expect(perk?.tier).toBe(2);
    expect(perk?.unlockThreshold).toBe(3);
  });

  test("aggregates the perk, level and perk point counts of a race", () => {
    const { races } = parseFsPerks(rawFile, locstring);
    const race = races["american"];

    expect(race?.perkCount).toBe(2);
    expect(race?.levelCount).toBe(4);
    expect(race?.totalCost).toBe(170);
  });

  test("resolves the perk texts, both plain and formatter ones", () => {
    const { races } = parseFsPerks(rawFile, locstring);
    const [reinforceCost] = races["american"]?.tiers[0].perks ?? [];

    expect(reinforceCost.name).toBe("Reduce Reinforce Cost");
    expect(reinforceCost.description).toBe(
      "Reduces the cost to reinforce your squad's fallen members.",
    );
    expect(reinforceCost.effect).toBe("2.5/s");
  });

  test("falls back to the perk id when the name locstring is missing", () => {
    const { races } = parseFsPerks(rawFile, locstring);

    expect(races["dak"]?.tiers[0].perks[0].name).toBe("hoff_perk_salvage_dak");
  });

  test("turns the escaped new lines of the locstrings into real ones", () => {
    const { races } = parseFsPerks(rawFile, locstring);

    expect(races["american"]?.tiers[1].perks[0].description).toBe(
      "Garrison prebuilt Outposts.\n• Officer — Grants Manpower",
    );
  });

  test("resolves the level texts and sums up the costs", () => {
    const { races } = parseFsPerks(rawFile, locstring);
    const [reinforceCost] = races["american"]?.tiers[0].perks ?? [];

    expect(reinforceCost.levels.map((level) => level.effect)).toEqual(["12%", "24%"]);
    expect(reinforceCost.levels.map((level) => level.cost)).toEqual([25, 30]);
    expect(reinforceCost.levels.map((level) => level.cumulativeCost)).toEqual([25, 55]);
    expect(reinforceCost.totalCost).toBe(55);
  });

  test("keeps the modifiers of a level and defaults them to an empty list", () => {
    const { races } = parseFsPerks(rawFile, locstring);

    expect(races["dak"]?.tiers[0].perks[0].levels[0].modifiers).toEqual([
      { id: "AMOUNT_MUNITIONS", type: "int", value: 1 },
      {
        id: "ENTITY_PBG_1",
        type: "pbgid",
        value: "ebps/hoff/american/drops/hoff_weapon_drop_perk_crate_1_us",
      },
    ]);
    // The unlock perk has no modifiers at all.
    expect(races["american"]?.tiers[1].perks[0].levels[0].modifiers).toEqual([]);
    expect(races["american"]?.tiers[1].perks[0].levels[0].effect).toBe("Officer");
  });

  test("skips races which are not ours", () => {
    const broken = {
      races: { ...rawFile.races, martians: { id: "martians", ui: {}, tiers: [] } },
    } as unknown as RawFsPerksFile;

    expect(Object.keys(parseFsPerks(broken, locstring).races)).toHaveLength(2);
  });
});

describe("resolveFsPerkLocstring", () => {
  test("resolves an id and gives null for everything it cannot", () => {
    expect(resolveFsPerkLocstring("11272957", locstring)).toBe("Reduce Reinforce Cost");
    expect(resolveFsPerkLocstring("999999", locstring)).toBeNull();
    expect(resolveFsPerkLocstring(undefined, locstring)).toBeNull();
  });
});

describe("resolveFsPerkFormatter", () => {
  test("substitutes numeric arguments", () => {
    expect(resolveFsPerkFormatter({ formatter: "11273224", arguments: [2.5] }, locstring)).toBe(
      "2.5/s",
    );
  });

  test("appends the percentage sign of the .p format spec", () => {
    expect(resolveFsPerkFormatter({ formatter: "11273227", arguments: [20] }, locstring)).toBe(
      "20%",
    );
  });

  test("resolves locstring arguments", () => {
    expect(
      resolveFsPerkFormatter({ formatter: "11273408", arguments: [2, "11152057"] }, locstring),
    ).toBe("+2 Munitions");
  });

  test("handles the placeholders of a formatter with several arguments in any order", () => {
    const withOrder = { "1": "%2% before %1%" };

    expect(resolveFsPerkFormatter({ formatter: "1", arguments: [1, 2] }, withOrder)).toBe(
      "2 before 1",
    );
  });

  test("keeps escaped percentage signs and drops unknown placeholders", () => {
    const weird = { "1": "100%% done %3%" };

    expect(resolveFsPerkFormatter({ formatter: "1", arguments: [1] }, weird)).toBe("100% done ");
  });

  test("gives null when the formatter locstring is missing", () => {
    expect(resolveFsPerkFormatter({ formatter: "999999", arguments: [] }, locstring)).toBeNull();
    expect(resolveFsPerkFormatter(null, locstring)).toBeNull();
  });
});

describe("resolveFsPerkText", () => {
  test("prefers the plain locstring over the formatter", () => {
    expect(
      resolveFsPerkText("11272957", { formatter: "11273224", arguments: [2.5] }, locstring),
    ).toBe("Reduce Reinforce Cost");
  });

  test("falls back to the formatter and then to null", () => {
    expect(
      resolveFsPerkText(undefined, { formatter: "11273224", arguments: [2.5] }, locstring),
    ).toBe("2.5/s");
    expect(resolveFsPerkText(undefined, undefined, locstring)).toBeNull();
  });
});

describe("unescapeFsPerkText", () => {
  test("turns the escape sequences of the game files into real characters", () => {
    expect(unescapeFsPerkText("a\\r\\nb\\nc")).toBe("a\nb\nc");
    expect(unescapeFsPerkText("plain")).toBe("plain");
  });
});
