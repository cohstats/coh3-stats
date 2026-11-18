/** @jest-environment node */

import { gzipSync } from "node:zlib";
import config from "../../../config";
import {
  createDpsUnitCatalog,
  EMPTY_DPS_DATA,
  fetchDpsData,
  filterDpsUnitOptions,
} from "../../../src/unitStats/dpsData";
import { buildDpsUnitOptions } from "../../../src/unitStats/dpsData.server";
import type { DpsData, DpsUnitOption } from "../../../src/unitStats/dpsData";
import type { SbpsType } from "../../../src/unitStats/mappingSbps";
import type { WeaponMember } from "../../../src/unitStats/dpsCommon";

const squad = (id: string): SbpsType =>
  ({
    id,
    path: `american/infantry/${id}`,
    faction: "american",
    unitType: "infantry",
    ui: { screenName: id, helpText: "", iconName: "unit", symbolIconName: "symbol" },
    loadout: [],
    populationExt: { personnel_pop: 0, upkeep_per_pop: { fuel: 0, manpower: 0, munition: 0 } },
  }) as unknown as SbpsType;

const dataset = (patch = "current"): DpsData => {
  const data = { ...EMPTY_DPS_DATA, patch, sbpsData: [squad("first"), squad("second")] };
  return { ...data, unitOptions: buildDpsUnitOptions(data) };
};

describe("on-demand calculator units", () => {
  it("does no calculator initialization while constructing or filtering a picker", () => {
    const data = dataset();
    const nameReads = jest.fn(() => "first");
    Object.defineProperty(data.sbpsData[0].ui, "screenName", { get: nameReads });
    const catalog = createDpsUnitCatalog(data);
    expect(filterDpsUnitOptions(catalog.unitOptions, [], false, false)).toHaveLength(2);
    expect(nameReads).not.toHaveBeenCalled();

    expect(catalog.getUnit("first")?.id).toBe("first");
    expect(nameReads).toHaveBeenCalled();
    const reads = nameReads.mock.calls.length;
    expect(catalog.getUnit("first")?.id).toBe("first");
    expect(nameReads).toHaveBeenCalledTimes(reads);
    expect(catalog.getUnit("missing")).toBeUndefined();
    expect(nameReads).toHaveBeenCalledTimes(reads);
  });

  it("keeps separately selected copies and their reset loadouts independent", () => {
    const catalog = createDpsUnitCatalog(dataset());
    const first = catalog.createUnit("first")!;
    const second = catalog.createUnit("first")!;
    first.weapon_member.push({ num: 4 } as WeaponMember);
    first.def_weapon_member.push({ num: 4 } as WeaponMember);
    first.custom_modifiers!.damage.value = 20;
    first.custom_modifiers!.damage.enabled = true;
    first.veterancyLevel = 3;

    expect(second.weapon_member).toEqual([]);
    expect(second.def_weapon_member).toEqual([]);
    expect(second.custom_modifiers!.damage.value).toBe(0);
    expect(second.veterancyLevel).toBe(0);
    expect(catalog.createUnit("first")).toEqual(second);
  });

  it("does not reuse a squad's calculator data from a different patch", () => {
    const previous = dataset("previous");
    previous.sbpsData[0] = {
      ...previous.sbpsData[0],
      ui: { ...previous.sbpsData[0].ui, screenName: "Old name" },
    };
    const current = createDpsUnitCatalog(dataset("current"));
    const old = createDpsUnitCatalog(previous);
    expect(current.getUnit("first")?.screen_name).toBe("first");
    expect(old.getUnit("first")?.screen_name).toBe("Old name");
  });

  it("keeps unarmed defenders available while applying faction and Final Stand filters", () => {
    const base = dataset().unitOptions[0];
    const options: DpsUnitOption[] = [
      { ...base, id: "armed", hasWeapons: true },
      { ...base, id: "unarmed", hasWeapons: false, infantryTarget: false },
      { ...base, id: "hoff_armed", path: "hoff/american/infantry/hoff_armed", hasWeapons: true },
      { ...base, id: "german", faction: "german", hasWeapons: true },
    ];
    expect(filterDpsUnitOptions(options, ["american"]).map((unit) => unit.id)).toEqual(["armed"]);
    expect(
      filterDpsUnitOptions(options, ["american"], false, false).map((unit) => unit.id),
    ).toEqual(["armed", "unarmed"]);
    expect(filterDpsUnitOptions(options, ["american"], true).map((unit) => unit.id)).toEqual([
      "armed",
      "hoff_armed",
    ]);
  });
});

describe("mapped calculator downloads", () => {
  const originalFetch = global.fetch;
  const originalDecompressionStream = global.DecompressionStream;
  afterEach(() => {
    global.fetch = originalFetch;
    global.DecompressionStream = originalDecompressionStream;
    Reflect.deleteProperty(globalThis, "__NEXT_DATA__");
  });

  it("shares a request between both views and the latest patch alias", async () => {
    const data = dataset(config.latestPatch);
    const fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => data });
    global.fetch = fetch;
    const first = fetchDpsData();
    const second = fetchDpsData(config.latestPatch);
    expect(first).toBe(second);
    expect(await first).toBe(data);
    expect(await fetchDpsData()).toBe(data);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`/api/dps-data/${config.latestPatch}`);
  });

  it("retries a failed patch download rather than caching its failure", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => dataset("retry-patch") });
    global.fetch = fetch;
    await expect(fetchDpsData("retry-patch")).rejects.toThrow("Failed to load DPS data");
    expect((await fetchDpsData("retry-patch")).patch).toBe("retry-patch");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("decodes the cached gzip package without changing the mapped data", async () => {
    const data = dataset("gzip-patch");
    const compressed = new Uint8Array(gzipSync(JSON.stringify(data)));
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(compressed, { headers: { "Content-Type": "application/gzip" } }),
      );
    expect(await fetchDpsData("gzip-patch")).toEqual(data);
  });

  it("uses plain JSON when the browser has no native gzip decoder", async () => {
    global.DecompressionStream = undefined as unknown as typeof DecompressionStream;
    const fetch = jest.fn().mockResolvedValue(Response.json(dataset("plain-patch")));
    global.fetch = fetch;
    expect((await fetchDpsData("plain-patch")).patch).toBe("plain-patch");
    expect(fetch).toHaveBeenCalledWith("/api/dps-data/plain-patch.json");
  });

  it("uses the page build ID to avoid stale CDN mappings after deployment", async () => {
    Object.assign(globalThis, { __NEXT_DATA__: { buildId: "new-build" } });
    const fetch = jest.fn().mockResolvedValue(Response.json(dataset("build-patch")));
    global.fetch = fetch;
    await fetchDpsData("build-patch");
    expect(fetch).toHaveBeenCalledWith("/api/dps-data/build-patch?build=new-build");
  });
});
