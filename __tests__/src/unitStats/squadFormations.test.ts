import fixture from "../../test-assets/formation-fixtures.json";
import {
  mapFormationData,
  mapSquadFormationReferences,
} from "../../../src/unitStats/mappingFormations";
import {
  getEffectiveFormationCounts,
  getSquadHumanCount,
  resolveSquadFormation,
  rotateFormationModels,
  getInfantryFormationExample,
  INFANTRY_FORMATION_PRESETS,
  getCalculatorFormation,
  getMinimumFormationSpacing,
  getDirectionalCoverLine,
} from "../../../src/unitStats/squadFormations";
import type { SbpsType } from "../../../src/unitStats/mappingSbps";
import type { EbpsType } from "../../../src/unitStats/mappingEbps";

const data = mapFormationData(fixture.squadFormations, fixture.formations);
const squad = (id: keyof typeof fixture.squads): SbpsType =>
  ({
    ...fixture.squads[id],
    formation: mapSquadFormationReferences(fixture.squads[id].rawFormation),
  }) as unknown as SbpsType;
const gun = { teamWeapon: { type: "tp_mobile", requiredCrew: 2 } } as EbpsType;
const positions = (id: keyof typeof fixture.squads, count: number) =>
  resolveSquadFormation(squad(id), data, count)!.models;
const find = (models: ReturnType<typeof positions>, slot: string) =>
  models.find((model) => model.slot === slot)!;

it("selects formation geometry independently and bunches the default without changing its shape", () => {
  const normal = getCalculatorFormation(squad("panzergrenadier_ak"), data, 2, "default");
  const covered = getCalculatorFormation(squad("panzergrenadier_ak"), data, 2, "cover");
  const bunched = getCalculatorFormation(squad("panzergrenadier_ak"), data, 2, "bunched");
  expect(normal.models).toEqual(positions("panzergrenadier_ak", 2));
  expect(bunched.models.map(({ id }) => id)).toEqual(normal.models.map(({ id }) => id));
  expect(bunched.models[0]).toEqual(normal.models[0]);
  expect(getMinimumFormationSpacing(bunched.models)).toBeCloseTo(
    getMinimumFormationSpacing(covered.models),
  );
  expect(getMinimumFormationSpacing(bunched.models)).toBeLessThan(
    getMinimumFormationSpacing(normal.models),
  );
  const displayed = covered.models.map((model) => ({ ...model, x: -model.x, y: -model.y }));
  const line = getDirectionalCoverLine(displayed)!;
  expect(displayed.every((model) => model.y > line.y)).toBe(true);
});

describe("formation observations from in-game validation", () => {
  it.each(INFANTRY_FORMATION_PRESETS)(
    "uses the exported %s layout for each one-to-six-person example",
    (id) => {
      for (let count = 1; count <= 6; count++) {
        const expected =
          id === "riflemen_cover"
            ? resolveSquadFormation(squad("riflemen_us"), data, count, "heavy")!.models
            : positions(id, count);
        const example = getInfantryFormationExample(id, count);
        expect(example).toHaveLength(count);
        expect(example.map(({ id, slot }) => ({ id, slot }))).toEqual(
          expected.map(({ id, slot }) => ({ id, slot })),
        );
        example.forEach((model, index) => {
          expect(model.x).toBeCloseTo(expected[index].x, 8);
          expect(model.y).toBeCloseTo(expected[index].y, 8);
        });
      }
    },
  );

  it("preserves counts and separate positions when repeating an example for larger squads", () => {
    for (const preset of INFANTRY_FORMATION_PRESETS)
      for (const count of [0, 7, 13]) {
        const models = getInfantryFormationExample(preset, count);
        expect(models).toHaveLength(count);
        expect(new Set(models.map(({ id }) => id)).size).toBe(count);
        expect(new Set(models.map(({ x, y }) => `${x},${y}`)).size).toBe(count);
        expect(models.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
      }
  });

  it("composes Riflemen group positions and local offsets", () => {
    const models = positions("riflemen_us", 6);
    expect(models).toHaveLength(6);
    expect(find(models, "L2")).toMatchObject({ x: -5, y: -5.5 });
    expect(find(models, "R2")).toMatchObject({ x: 5, y: -5.5 });
  });

  it("uses each element's scale once: Wehr Pgrens 4.8 and Saboteurs 4.5", () => {
    expect(find(positions("panzergrenadier_ger", 2), "C2").x).toBeCloseTo(-4.8);
    expect(find(positions("saboteurs_battlegroup_partisan", 2), "C2").x).toBeCloseTo(4.5);
  });

  it("scales DAK Pgren group separation to 7.2", () => {
    expect(find(positions("panzergrenadier_ak", 2), "S1").x).toBeCloseTo(7.2);
  });

  it.each([
    ["riflemen_us", 2],
    ["scout_us", 2],
    ["pioneer_ger", 3],
    ["jaeger_ger", 4],
    ["panzergrenadier_ger", 4],
  ] as const)("puts unpaired-left assignments into core for %s at %i models", (id, count) => {
    const models = positions(id, count);
    expect(models).toHaveLength(count);
    expect(models.every((model) => model.group === "core")).toBe(true);
  });

  it("retains scouts while discarding the malformed Engineer row's left assignment", () => {
    const models = positions("engineer_us", 3);
    expect(models.map((model) => model.slot)).toEqual(["C1", "C2", "S1"]);
  });

  it("keeps paired flanks and scout-only distributions", () => {
    expect(positions("scout_us", 3).map((model) => model.slot)).toEqual(["C1", "L1", "R1"]);
    expect(positions("ranger_us", 4).map((model) => model.slot)).toEqual([
      "C1",
      "C2",
      "C3",
      "S1",
    ]);
  });

  it("fills the missing Guastatori assignment into their distant fourth core slot", () => {
    expect(find(positions("guastatori_ak", 4), "C4").x).toBeCloseTo(10.8);
    expect(find(positions("guastatori_ak", 4), "C4").y).toBeCloseTo(-8.7);
  });

  it("can disable the left workaround without changing the exported row", () => {
    const raw = { core: 3, left: 1, right: 0, scout: 0 };
    expect(getEffectiveFormationCounts(raw, 4, false)).toEqual(raw);
    expect(getEffectiveFormationCounts(raw, 4, true)).toEqual({
      core: 4,
      left: 0,
      right: 0,
      scout: 0,
    });
    expect(raw.left).toBe(1);
  });

  it("leaves untested right-only combinations untouched", () => {
    expect(getEffectiveFormationCounts({ core: 1, left: 0, right: 1, scout: 0 }, 2)).toEqual({
      core: 1,
      left: 0,
      right: 1,
      scout: 0,
    });
  });

  it.each(["at_gun_50mm_pak_38_ak", "leig_75mm_ak"] as const)(
    "uses observed spare crew slots for %s",
    (id) => {
      const cases: Record<number, string[]> = {
        2: [],
        3: ["L1"],
        4: ["C2", "L1"],
        5: ["C2", "C3", "L1"],
        6: ["C2", "L1", "L2", "R1"],
      };
      for (const [count, slots] of Object.entries(cases)) {
        const result = resolveSquadFormation(squad(id), data, Number(count), "", false, gun)!;
        expect(result.models).toHaveLength(Number(count));
        expect(
          result.models.filter((model) => !model.operator).map((model) => model.slot),
        ).toEqual(slots);
        expect(result.models.filter((model) => model.operator)).toHaveLength(2);
        expect(result.weapon).toEqual({ x: 0, y: 0 });
        expect(result.models.some((model) => model.id === 1)).toBe(false); // The gun is not an infantry damage slot.
      }
    },
  );

  it.each(["hmg_mg42_ger", "mortar_81mm_ger"] as const)(
    "omits the last core slot for carried %s",
    (id) => {
      const carried = {
        teamWeapon: { type: "tp_carried", requiredCrew: 1 },
      } as EbpsType;
      const result = resolveSquadFormation(squad(id), data, 4, "", false, carried)!;
      expect(result.models.map((model) => model.slot)).toEqual(["C1", "C2", "L1", "R1"]);
      expect(result.models).toHaveLength(4);
    },
  );

  it("does not invent an allocation for an untested seven-human mobile crew", () => {
    expect(
      resolveSquadFormation(squad("at_gun_50mm_pak_38_ak"), data, 7, "", false, gun),
    ).toBeUndefined();
  });

  it("selects cover layouts and counts people separately from the crew weapon", () => {
    expect(getSquadHumanCount(squad("at_gun_50mm_pak_38_ak"))).toBe(5);
    const result = resolveSquadFormation(squad("riflemen_us"), data, 6, "heavy")!;
    expect(result.reference).toBe("squad_formations/common/cover");
    expect(find(result.models, "C2").x).toBeCloseTo(3);
  });

  it("handles missing old-patch formation data and rotates world positions", () => {
    expect(resolveSquadFormation(squad("riflemen_us"), {}, 6)).toBeUndefined();
    const result = rotateFormationModels([{ id: 1, x: 4, y: 0, enabled: true }], 90)[0];
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(4);
  });
});
