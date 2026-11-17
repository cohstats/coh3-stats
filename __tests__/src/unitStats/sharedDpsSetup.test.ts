/** @jest-environment node */

import config from "../../../config";
import { deflateSync, inflateSync } from "node:zlib";
import { setUnitVeterancyLevel } from "../../../src/unitStats/dpsCommon";
import { calculatorUnit, calculatorMember } from "../../test-assets/calculator-fixtures";
import {
  encodeSharedDpsSetup,
  decodeSharedDpsSetup,
  snapshotDpsUnit,
  restoreDpsUnit,
  readSharedDpsSetup,
  type SharedDpsSetup,
} from "../../../src/unitStats/sharedDpsSetup";
import type { DpsUnitCatalog } from "../../../src/unitStats/dpsData";
import type { CustomizableUnit } from "../../../src/unitStats/dpsCommon";
import {
  DEFAULT_DPS_SETTINGS,
  DEFAULT_COMPARE_SETTINGS,
  DEFAULT_COMPARE_TARGET_IDS,
  DEFAULT_SCATTER_FORMATION,
} from "../../../src/unitStats/dpsDefaults";

const initialSetup = (mode: SharedDpsSetup["mode"]): SharedDpsSetup =>
  mode === "vs"
    ? {
        v: 1,
        mode,
        ...DEFAULT_DPS_SETTINGS,
        filters: [[], []],
        slots: [
          { patch: config.latestPatch, unit: null },
          { patch: config.latestPatch, unit: null },
        ],
      }
    : {
        v: 1,
        mode,
        allowAllWeapons: DEFAULT_DPS_SETTINGS.allowAllWeapons,
        showFinalStand: DEFAULT_DPS_SETTINGS.showFinalStand,
        ...DEFAULT_COMPARE_SETTINGS,
        samples: DEFAULT_COMPARE_SETTINGS.samples as 576,
        patch: config.latestPatch,
        attackers: [],
        target: { id: DEFAULT_COMPARE_TARGET_IDS.infantry },
        filter: [],
        scatter: {
          ...DEFAULT_SCATTER_FORMATION,
          formation: "default",
          directionalCover: false,
          groundTarget: null,
        },
        preview: null,
      };

it.each(["vs", "compare"] as const)(
  "needs no shared payload for a fresh %s calculator",
  async (mode) => {
    expect(await encodeSharedDpsSetup(initialSetup(mode))).toBe("");
  },
);

it("recognizes the default-only comparison link reported by the user", async () => {
  const encoded =
    "eyIwIjoxLCIxIjoiY29tcGFyZSIsIjIiOiIzLjAuMSIsIjUiOltdLCI2Ijp7ImwiOiJwYW56ZXJncmVuYWRpZXJfYWsifX0";
  const decoded = await decodeSharedDpsSetup(encoded);
  expect(decoded).toBeDefined();
  // Its patch is explicit; use today's default when checking whether a payload is necessary.
  expect(
    await encodeSharedDpsSetup({ ...decoded!, patch: config.latestPatch } as SharedDpsSetup),
  ).toBe("");
});

it.each(["vs", "compare"] as const)(
  "omits default units and patch metadata from changed %s settings",
  async (mode) => {
    const original = { ...initialSetup(mode), showFinalStand: true };
    const encoded = await encodeSharedDpsSetup(original);
    const payload = encoded.startsWith("z.")
      ? inflateSync(Buffer.from(encoded.slice(2), "base64url")).toString()
      : Buffer.from(encoded, "base64url").toString();
    expect(payload).not.toContain(config.latestPatch);
    expect(payload).not.toContain(DEFAULT_COMPARE_TARGET_IDS.infantry);
    // The payload contains only the format, mode, and one changed setting.
    expect(Object.keys(JSON.parse(payload))).toHaveLength(3);
    const decoded = await decodeSharedDpsSetup(encoded);
    expect(decoded).toMatchObject(original);
  },
);

it("stores only a selected VS unit without repeating default slot patches", async () => {
  const original = initialSetup("vs");
  if (original.mode !== "vs") throw new Error("Expected VS setup");
  original.slots[1].unit = { id: "riflemen_us" };
  const encoded = await encodeSharedDpsSetup(original);
  const payload = encoded.startsWith("z.")
    ? inflateSync(Buffer.from(encoded.slice(2), "base64url")).toString()
    : Buffer.from(encoded, "base64url").toString();
  expect(payload).not.toContain(config.latestPatch);
  expect(await decodeSharedDpsSetup(encoded)).toEqual(original);
});

it.each([null, { id: DEFAULT_COMPARE_TARGET_IDS.infantry, cover: "heavy", vet: 2 }] as const)(
  "preserves an empty or customized default Compare defender: %j",
  async (target) => {
    const original = initialSetup("compare");
    if (original.mode !== "compare") throw new Error("Expected Compare setup");
    original.target = target;
    expect(await decodeSharedDpsSetup(await encodeSharedDpsSetup(original))).toEqual(original);
  },
);

const namedMember = (id: string, count: number, hardpoint?: number) => {
  const member = calculatorMember();
  return {
    ...member,
    weapon_id: id,
    num: count,
    hardpointIndex: hardpoint,
    weapon: { ...member.weapon, id },
  };
};
const defaultUnit = () => {
  const rifle = namedMember("default_rifle", 4, 0);
  return calculatorUnit({
    cover: "",
    def_member: "soldier",
    weapon_member: [rifle, namedMember("optional_lmg", 0, 1)],
    def_weapon_member: [{ ...rifle }],
  });
};
const cloneUnit = (unit: CustomizableUnit): CustomizableUnit => ({
  ...unit,
  weapon_member: unit.weapon_member.map((member) => ({ ...member })),
  def_weapon_member: unit.def_weapon_member.map((member) => ({ ...member })),
  custom_modifiers: JSON.parse(JSON.stringify(unit.custom_modifiers)),
});
const catalogFor = (baseline: CustomizableUnit): DpsUnitCatalog =>
  ({
    getUnit: (id: string) => (id === baseline.id ? baseline : undefined),
    createUnit: (id: string) => (id === baseline.id ? cloneUnit(baseline) : undefined),
    data: {
      weaponData: [namedMember("captured_weapon", 1).weapon],
      ebpsData: [baseline.weapon_member[0].ebps],
    },
  }) as unknown as DpsUnitCatalog;

const savedUnit = () => {
  const unit = calculatorUnit({
    id: "rangers",
    is_moving: true,
    cover: "garrison",
    veterancyLevel: 3,
    heavyBarrelsEnabled: true,
    dakCoaxUpgradeEnabled: true,
  });
  unit.weapon_member = [
    { ...calculatorMember(), num: 3, hardpointIndex: 0 },
    { ...calculatorMember(), num: 0, hardpointIndex: 1 },
  ];
  unit.custom_modifiers!.accuracy = {
    enabled: true,
    type: "percentage",
    value: 32,
    percentageValues: [10, 20],
  };
  unit.custom_modifiers!.range = { enabled: false, type: "additive", value: 5 };
  return unit;
};

const setup = (): Extract<SharedDpsSetup, { mode: "compare" }> => ({
  v: 1,
  mode: "compare",
  patch: config.latestPatch,
  attackers: [snapshotDpsUnit(savedUnit())!, snapshotDpsUnit(savedUnit())!],
  target: snapshotDpsUnit(calculatorUnit()),
  targetType: "infantry",
  filter: ["american"],
  allowAllWeapons: true,
  showFinalStand: true,
  fogOfWar: true,
  samples: 2025,
  scatter: {
    enabled: true,
    preset: "panzergrenadier_ak",
    formation: "cover",
    directionalCover: true,
    disabledModelIds: [2, 101],
    targetModelId: null,
    groundTarget: { x: -1.25, y: 3.5 },
    gunnerAngleDeg: 125,
  },
  preview: { attacker: 1, weapon: "gun", range: 22.5 },
  pendingAttacker: "rangers",
});

it("round trips the complete comparison, including duplicate attackers and preview settings", async () => {
  const original = setup();
  const encoded = await encodeSharedDpsSetup(original);
  expect(await decodeSharedDpsSetup(encoded)).toEqual(original);
  expect(await readSharedDpsSetup(`/explorer/dps-compare#setup=${encoded}`, "compare")).toEqual(
    original,
  );
  expect(await readSharedDpsSetup(`/explorer/dps#setup=${encoded}`, "vs")).toBeUndefined();
});

it("restores independent loadouts and manual settings from patch-backed units", () => {
  const original = savedUnit();
  const catalog = {
    createUnit: () => savedUnit(),
    data: { weaponData: [], ebpsData: [] },
  } as unknown as DpsUnitCatalog;
  const first = restoreDpsUnit(snapshotDpsUnit(original), catalog)!;
  const second = restoreDpsUnit(snapshotDpsUnit(original), catalog)!;
  expect(snapshotDpsUnit(first)).toEqual(snapshotDpsUnit(original));
  first.weapon_member[0].num = 9;
  first.custom_modifiers!.accuracy.percentageValues!.push(30);
  expect(second.weapon_member[0].num).toBe(3);
  expect(second.custom_modifiers!.accuracy.percentageValues).toEqual([10, 20]);
});

it("stores a default squad as its ID alone and inherits later default changes", () => {
  const baseline = defaultUnit();
  const saved = snapshotDpsUnit(cloneUnit(baseline), baseline)!;
  expect(JSON.parse(JSON.stringify(saved))).toEqual({ id: baseline.id });
  baseline.weapon_member[0].num = 5;
  expect(restoreDpsUnit(saved, catalogFor(baseline))!.weapon_member[0].num).toBe(5);
});

it("keeps zero counts and removed weapon cards distinct", () => {
  const baseline = defaultUnit();
  const current = cloneUnit(baseline);
  current.weapon_member[0].num = 0;
  const zero = snapshotDpsUnit(current, baseline)!;
  expect(zero.weapons).toEqual([{ index: 0, count: 0 }]);
  baseline.weapon_member[0].num = 5;
  expect(restoreDpsUnit(zero, catalogFor(baseline))!.weapon_member.map(({ num }) => num)).toEqual(
    [0, 0],
  );
  current.weapon_member = [];
  const removed = snapshotDpsUnit(current, baseline)!;
  expect(removed.weapons).toEqual([
    { index: 0, remove: true },
    { index: 1, remove: true },
  ]);
  expect(restoreDpsUnit(removed, catalogFor(baseline))!.weapon_member).toEqual([]);
});

it("restores modified and manually added weapons without serializing unchanged entries", () => {
  const baseline = defaultUnit();
  const current = cloneUnit(baseline);
  current.weapon_member[1].num = 2;
  current.weapon_member.push(namedMember("captured_weapon", 1));
  const saved = snapshotDpsUnit(current, baseline)!;
  expect(saved.weapons).toEqual([
    { index: 1, count: 2 },
    { id: "captured_weapon", count: 1, entity: "soldier", hardpoint: undefined },
  ]);
  const restored = restoreDpsUnit(saved, catalogFor(baseline))!;
  expect(restored.weapon_member.map(({ weapon_id, num }) => [weapon_id, num])).toEqual([
    ["default_rifle", 4],
    ["optional_lmg", 2],
    ["captured_weapon", 1],
  ]);
  restored.weapon_member[0].num = 99;
  expect(baseline.weapon_member[0].num).toBe(4);
});

it("preserves a changed weapon order so the default preview weapon stays the same", () => {
  const baseline = defaultUnit();
  const current = cloneUnit(baseline);
  current.weapon_member[1].num = 2;
  current.weapon_member.reverse();
  const saved = snapshotDpsUnit(current, baseline)!;
  const restored = restoreDpsUnit(saved, catalogFor(baseline))!;
  expect(restored.weapon_member.map(({ weapon_id }) => weapon_id)).toEqual([
    "optional_lmg",
    "default_rifle",
  ]);
  expect(snapshotDpsUnit(restored, baseline)).toEqual(saved);
});

it("preserves false, zero, and empty-string overrides instead of confusing them with omissions", () => {
  const baseline = defaultUnit();
  Object.assign(baseline, {
    cover: "heavy",
    is_moving: true,
    veterancyLevel: 2,
    heavyBarrelsEnabled: true,
    dakCoaxUpgradeEnabled: true,
  });
  const current = cloneUnit(baseline);
  Object.assign(current, {
    cover: "",
    is_moving: false,
    veterancyLevel: 0,
    heavyBarrelsEnabled: false,
    dakCoaxUpgradeEnabled: false,
  });
  const saved = snapshotDpsUnit(current, baseline)!;
  expect(saved).toMatchObject({
    cover: "",
    moving: false,
    vet: 0,
    heavyBarrels: false,
    dakCoax: false,
  });
  const restored = restoreDpsUnit(saved, catalogFor(baseline))!;
  expect(snapshotDpsUnit(restored)).toEqual(snapshotDpsUnit(current));
});

it("restores veterancy COUNT members exactly once", () => {
  const baseline = defaultUnit();
  baseline.sbps = {
    ...baseline.sbps,
    veterancyInfo: {
      one: { exp: 100, screenName: "", requirementIds: [], modifiers: [] },
      two: {
        exp: 200,
        screenName: "",
        requirementIds: [],
        modifiers: [{ id: "COUNT", value: 1 }],
      },
      three: { exp: 300, screenName: "", requirementIds: [], modifiers: [] },
    },
  };
  const current = cloneUnit(baseline);
  setUnitVeterancyLevel(current, 2);
  expect(current.weapon_member[0].num).toBe(5);
  const saved = snapshotDpsUnit(current, baseline)!;
  const restored = restoreDpsUnit(saved, catalogFor(baseline))!;
  expect(restored.weapon_member[0].num).toBe(5);
  expect(snapshotDpsUnit(restored, baseline)).toEqual(saved);
  setUnitVeterancyLevel(restored, 0);
  expect(restored.weapon_member[0].num).toBe(4);
});

it("omits default view settings while preserving disabled scatter and zero aiming coordinates", async () => {
  const baseline = defaultUnit();
  const original: SharedDpsSetup = {
    ...setup(),
    attackers: [snapshotDpsUnit(baseline, baseline)!],
    target: snapshotDpsUnit(baseline, baseline),
    allowAllWeapons: false,
    showFinalStand: false,
    filter: [],
    samples: 576,
    fogOfWar: false,
    pendingAttacker: undefined,
    preview: null,
    scatter: {
      enabled: false,
      preset: "panzergrenadier_ak",
      formation: "default",
      directionalCover: false,
      disabledModelIds: [],
      targetModelId: null,
      groundTarget: { x: 0, y: 0 },
      gunnerAngleDeg: 0,
    },
  };
  const encoded = await encodeSharedDpsSetup(original);
  expect(await decodeSharedDpsSetup(encoded)).toEqual(original);
  const decoded = await readSharedDpsSetup(`/explorer/dps-compare#setup=${encoded}`, "compare");
  expect(decoded).toMatchObject({
    scatter: { enabled: false, gunnerAngleDeg: 0, groundTarget: { x: 0, y: 0 } },
  });
});

it("round trips separate VS patch selections and chart/filter settings", async () => {
  const defender = savedUnit();
  defender.custom_modifiers!.receivedAccuracy = { type: "percentage", value: 20, enabled: true };
  defender.custom_modifiers!.receivedDamage = { type: "percentage", value: 30, enabled: true };
  const original: SharedDpsSetup = {
    v: 1,
    mode: "vs",
    allowAllWeapons: true,
    showFinalStand: false,
    showDpsHealth: true,
    filters: [["american"], ["german"]],
    slots: [
      { patch: config.latestPatch, unit: snapshotDpsUnit(defender) },
      { patch: Object.keys(config.patches)[1], unit: null },
    ],
  };
  const decoded = await decodeSharedDpsSetup(await encodeSharedDpsSetup(original));
  expect(decoded).toEqual(original);
  if (decoded?.mode !== "vs") throw new Error("Expected VS setup");
  const restored = restoreDpsUnit(decoded.slots[0].unit, catalogFor(defender))!;
  expect(restored.custom_modifiers!.receivedAccuracy.value).toBe(20);
  expect(restored.custom_modifiers!.receivedDamage.value).toBe(30);
});

it("compresses the full comparison to less than half its previous URL length", async () => {
  const original = setup();
  const legacy = Buffer.from(JSON.stringify(original)).toString("base64url");
  const compressed = await encodeSharedDpsSetup(original);
  expect(compressed).toMatch(/^z\.[\w-]+$/);
  expect(compressed.length).toBeLessThan(legacy.length / 2);
  expect(await decodeSharedDpsSetup(compressed)).toEqual(original);
});

it("uses the same compact format when native compression is unavailable", async () => {
  const compression = Object.getOwnPropertyDescriptor(globalThis, "CompressionStream")!;
  Object.defineProperty(globalThis, "CompressionStream", {
    configurable: true,
    value: undefined,
  });
  try {
    const original = setup();
    const encoded = await encodeSharedDpsSetup(original);
    expect(encoded).not.toContain(".");
    expect(await decodeSharedDpsSetup(encoded)).toEqual(original);
  } finally {
    Object.defineProperty(globalThis, "CompressionStream", compression);
  }
});

it("rejects corrupt compressed data and limits the decompressed payload size", async () => {
  expect(await decodeSharedDpsSetup("z.invalid!")).toBeUndefined();
  const encoded = await encodeSharedDpsSetup(setup());
  const packed = encoded.startsWith("z.")
    ? inflateSync(Buffer.from(encoded.slice(2), "base64url"))
    : Buffer.from(encoded, "base64url");
  const oversized = deflateSync(Buffer.concat([Buffer.alloc(200_000, " "), packed])).toString(
    "base64url",
  );
  expect(await decodeSharedDpsSetup(`z.${oversized}`)).toBeUndefined();
});

it("reports unsupported compressed links without treating them as an empty setup", async () => {
  const original = setup();
  const encoded = await encodeSharedDpsSetup(original);
  const decompression = Object.getOwnPropertyDescriptor(globalThis, "DecompressionStream")!;
  Object.defineProperty(globalThis, "DecompressionStream", {
    configurable: true,
    value: undefined,
  });
  try {
    await expect(decodeSharedDpsSetup(encoded)).rejects.toThrow("cannot decompress");
    const plain = await encodeSharedDpsSetup(original);
    expect(await decodeSharedDpsSetup(plain)).toEqual(original);
  } finally {
    Object.defineProperty(globalThis, "DecompressionStream", decompression);
  }
});

it("rejects malformed, oversized, unsupported, and invalid-patch setups", async () => {
  expect(await decodeSharedDpsSetup("invalid!")).toBeUndefined();
  expect(await decodeSharedDpsSetup("a".repeat(150001))).toBeUndefined();
  const original = setup();
  expect(
    await decodeSharedDpsSetup(
      await encodeSharedDpsSetup({ ...original, v: 99 } as unknown as SharedDpsSetup),
    ),
  ).toBeUndefined();
  expect(
    await decodeSharedDpsSetup(
      await encodeSharedDpsSetup({ ...original, patch: "missing" } as SharedDpsSetup),
    ),
  ).toBeUndefined();
});
