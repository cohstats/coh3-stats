import { WeaponBag, WeaponsData } from "../coh3/coh3-types";
import { NullableNormalizedWeapon } from "./types";
import { getWeaponProperties, normalizeWeapons } from "./weapon-normalizer";

describe("normalizeWeapons", () => {
  it("should return an empty array when weaponData is empty", () => {
    expect(normalizeWeapons({})).toEqual([]);
  });

  it("should correctly normalize weapon data", () => {
    const weaponData = {
      american: {
        small_arms: {
          american_bar_rifle: {
            weapon_bag: {
              accuracy: {
                near: 0.2,
                far: 0.5,
                mid: 0.3,
              },
              ui_name: {
                locstring: {
                  value: "bar-rifle",
                  name: "american_bar_rifle",
                },
              },
              icon_name: "american_bar_rifle",
            } as WeaponBag,
            pbgid: 111,
          },
        },
      },
    } as Partial<WeaponsData>;

    const locstrings = {
      "bar-rifle": "Bar Rifle",
    };

    const expectedOutput: NullableNormalizedWeapon[] = [
      {
        owner: "american",
        category: "small_arms",
        type: null,
        subtype: null,
        referenceName: "american_bar_rifle",
        pbgid: 111,
        accuracy: {
          near: 0.2,
          far: 0.5,
          mid: 0.3,
        },
        rawWeaponBag: {
          accuracy: {
            near: 0.2,
            far: 0.5,
            mid: 0.3,
          },
          ui_name: {
            locstring: {
              value: "bar-rifle",
              name: "american_bar_rifle",
            },
          },
          icon_name: "american_bar_rifle",
        },
        displayName: "Bar Rifle",
        iconName: "american_bar_rifle",
      },
    ];

    const output = normalizeWeapons(weaponData, locstrings);
    expect(output).toEqual(expectedOutput);
  });

  it("should correctly handle null or missing values", () => {
    const weaponData = {
      american: {
        small_arms: {
          american_bar_rifle: {
            weapon_bag: null,
            pbgid: null,
          },
        },
      },
    } as unknown as WeaponsData;

    const expectedOutput: NullableNormalizedWeapon[] = [];

    const output = normalizeWeapons(weaponData);
    expect(output).toEqual(expectedOutput);
  });
});

describe("getWeaponProperties", () => {
  it("returns null when given an empty array", () => {
    const result = getWeaponProperties([]);
    expect(result).toEqual(null);
  });

  it("returns the correct properties for a path without subtype", () => {
    const result = getWeaponProperties([
      "afrika_korps",
      "ballistic_weapon",
      "anti_tank_gun",
      "75_mm_leig_direct_shot_ak",
    ]);

    expect(result).toEqual({
      owner: "afrika_korps",
      category: "ballistic_weapon",
      type: "anti_tank_gun",
      subtype: null,
      referenceName: "75_mm_leig_direct_shot_ak",
    });
  });

  it("returns the correct properties for a path with subtype", () => {
    const result = getWeaponProperties([
      "american",
      "small_arms",
      "single_fire",
      "rifle",
      "m1_garand",
    ]);

    expect(result).toEqual({
      owner: "american",
      category: "small_arms",
      type: "single_fire",
      subtype: "rifle",
      referenceName: "m1_garand",
    });
  });

  it("returns the correct properties for a short path", () => {
    const result = getWeaponProperties(["afrika_korps", "special", "propaganda_war_ak"]);

    expect(result).toEqual({
      owner: "afrika_korps",
      category: "special",
      type: null,
      subtype: null,
      referenceName: "propaganda_war_ak",
    });
  });
});
