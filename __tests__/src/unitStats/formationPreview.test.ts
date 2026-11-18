import fixture from "../../test-assets/formation-fixtures.json";
import {
  mapFormationData,
  mapSquadFormationReferences,
} from "../../../src/unitStats/mappingFormations";
import { resolveSquadFormation } from "../../../src/unitStats/squadFormations";
import { getSquadFormationPreview } from "../../../src/unitStats/formationPreview";
import { omitSquadFormation, type SbpsType } from "../../../src/unitStats/mappingSbps";
import type { EbpsType } from "../../../src/unitStats/mappingEbps";

const data = mapFormationData(fixture.squadFormations, fixture.formations);
const squad = (id: keyof typeof fixture.squads): SbpsType =>
  ({
    ...fixture.squads[id],
    formation: mapSquadFormationReferences(fixture.squads[id].rawFormation),
  }) as unknown as SbpsType;

describe("getSquadFormationPreview", () => {
  it("precomputes the positions for every squad size", () => {
    const riflemen = squad("riflemen_us");
    const preview = getSquadFormationPreview(riflemen, [], data)!;

    expect(preview.squadSize).toBe(6);
    const defaultOption = preview.options[0];
    expect(defaultOption.coverTypes[0]).toBe("tp_defcover");
    expect(defaultOption.layouts).toHaveLength(6);

    defaultOption.layouts.forEach((layout, index) => {
      const expected = resolveSquadFormation(riflemen, data, index + 1)!.models;
      expect(layout?.weapon).toBeNull();
      expect(layout?.models).toHaveLength(index + 1);
      layout?.models.forEach((model, modelIndex) => {
        expect(model.element).toBe(expected[modelIndex].group);
        expect(model.x).toBeCloseTo(expected[modelIndex].x, 2);
        expect(model.y).toBeCloseTo(expected[modelIndex].y, 2);
      });
    });
  });

  it("groups the cover types which share a formation", () => {
    const riflemen = squad("riflemen_us");
    const preview = getSquadFormationPreview(riflemen, [], data)!;

    const coverTypes = preview.options.flatMap((option) => option.coverTypes);
    expect(new Set(coverTypes).size).toBe(coverTypes.length);
    expect(coverTypes.sort()).toEqual(Object.keys(riflemen.formation!.cover).sort());

    // The heavy cover formation differs from the default one in the fixture.
    const heavy = preview.options.find((option) => option.coverTypes.includes("tp_heavy_cover"));
    expect(heavy).not.toBe(preview.options[0]);
    expect(heavy?.layouts[5]?.models).toHaveLength(6);
  });

  it("marks the team weapon crew and the weapon position", () => {
    const hmg = squad("hmg_mg42_ger");
    const weapon = {
      id: "w_mg42_hmg_ger",
      teamWeapon: { type: "tp_carried", requiredCrew: 2 },
    } as EbpsType;
    const preview = getSquadFormationPreview(hmg, [weapon], data)!;

    expect(preview.squadSize).toBe(4);
    const full = preview.options[0].layouts[3]!;
    expect(full.models).toHaveLength(4);
    expect(full.weapon).not.toBeNull();
  });

  it("returns null when there is nothing to draw", () => {
    const riflemen = squad("riflemen_us");
    expect(getSquadFormationPreview({ ...riflemen, formation: undefined }, [], data)).toBeNull();
    expect(
      getSquadFormationPreview(
        { ...riflemen, loadout: [{ ...riflemen.loadout[0], num: 1 }] },
        [],
        data,
      ),
    ).toBeNull();
    expect(getSquadFormationPreview(riflemen, [], {})).toBeNull();
  });
});

describe("omitSquadFormation", () => {
  it("drops the formation tables without touching the mapped squad", () => {
    const riflemen = squad("riflemen_us");
    const props = omitSquadFormation(riflemen);

    expect("formation" in props).toBe(false);
    expect(props.id).toBe("riflemen_us");
    expect(props.loadout).toBe(riflemen.loadout);
    // The cached squad keeps it for the formation card and the DPS tool.
    expect(riflemen.formation).toBeDefined();
  });
});
