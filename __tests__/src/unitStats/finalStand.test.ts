import {
  filterFinalStandUnits,
  isFinalStandFaction,
  isFinalStandUnit,
  isFinalStandUnitId,
} from "../../../src/unitStats/finalStand";

describe("isFinalStandUnitId", () => {
  it("detects the hoff_ prefix used by all Final Stand units", () => {
    expect(isFinalStandUnitId("hoff_enemy_fallschirmjagers_ger")).toBe(true);
    expect(isFinalStandUnitId("hoff_player_riflemen_us")).toBe(true);
  });

  it("returns false for regular units and missing ids", () => {
    expect(isFinalStandUnitId("panzergrenadier_ak")).toBe(false);
    expect(isFinalStandUnitId("riflemen_us")).toBe(false);
    expect(isFinalStandUnitId("")).toBe(false);
    expect(isFinalStandUnitId(undefined)).toBe(false);
    expect(isFinalStandUnitId(null)).toBe(false);
  });
});

describe("isFinalStandUnit", () => {
  it("uses the data file path when available", () => {
    expect(isFinalStandUnit({ id: "hoff_enemy_sniper_us", path: "hoff/american/infantry" })).toBe(
      true,
    );
    expect(isFinalStandUnit({ id: "riflemen_us", path: "races/american/infantry" })).toBe(false);
  });

  it("falls back to the id when there is no path", () => {
    expect(isFinalStandUnit({ id: "hoff_enemy_sniper_us" })).toBe(true);
    expect(isFinalStandUnit({ id: "riflemen_us" })).toBe(false);
    expect(isFinalStandUnit(undefined)).toBe(false);
  });
});

describe("isFinalStandFaction", () => {
  it("only matches the hoff folder weapons / upgrades are mapped to", () => {
    expect(isFinalStandFaction("hoff")).toBe(true);
    expect(isFinalStandFaction("american")).toBe(false);
    expect(isFinalStandFaction(undefined)).toBe(false);
  });
});

describe("filterFinalStandUnits", () => {
  const units = [{ id: "riflemen_us" }, { id: "hoff_enemy_riflemen_us" }];

  it("removes Final Stand units by default", () => {
    expect(filterFinalStandUnits(units, false)).toEqual([{ id: "riflemen_us" }]);
  });

  it("keeps them when they are asked for", () => {
    expect(filterFinalStandUnits(units, true)).toEqual(units);
  });
});
