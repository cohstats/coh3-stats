import { z } from "zod";
import config from "../../config";
import { createDefaultCustomModifiers, mapWeaponMember, updateHealth } from "./dpsCommon";
import type { CustomizableUnit, CustomModifiers, WeaponMember } from "./dpsCommon";
import type { DpsUnitCatalog } from "./dpsData";
import {
  DEFAULT_DPS_SETTINGS,
  DEFAULT_COMPARE_SETTINGS,
  DEFAULT_COMPARE_TARGET_IDS,
  DEFAULT_SCATTER_FORMATION,
} from "./dpsDefaults";

const id = z.string().min(1).max(240);
const patch = z
  .string()
  .refine((value) => Object.hasOwn(config.patches, value))
  .default(config.latestPatch);
const finite = z.number().finite();
const modifier = z.object({
  type: z.enum(["percentage", "absolute", "additive"]),
  value: finite,
  enabled: z.boolean(),
  percentageValues: z.array(finite).max(100).optional(),
});
const modifiers = z.record(z.string(), modifier).refine((entries) =>
  Object.entries(entries).every(([key, entry]) => {
    if (!Object.hasOwn(createDefaultCustomModifiers(), key)) return false;
    if (["receivedAccuracy", "receivedDamage", "scatterAccuracy"].includes(key)) {
      return entry.type === "percentage";
    }
    return entry.type !== "additive" || ["damage", "range", "armor", "hitpoints"].includes(key);
  }),
);
const addedWeapon = z.object({
  id,
  count: finite.min(0).max(1000),
  entity: id.optional(),
  hardpoint: z.number().int().min(0).max(100).optional(),
});
const weaponIndex = z.number().int().min(0).max(149);
const weapon = z.union([
  z.object({ index: weaponIndex, count: finite.min(0).max(1000) }),
  z.object({ index: weaponIndex, remove: z.literal(true) }),
  addedWeapon,
]);
const unit = z.object({
  id,
  weapons: z.array(weapon).max(150).optional(),
  weaponOrder: z
    .array(weaponIndex)
    .max(150)
    .refine((order) => new Set(order).size === order.length)
    .optional(),
  cover: z.enum(["", "heavy", "light", "negative", "garrison"]).optional(),
  moving: z.boolean().optional(),
  vet: z.number().int().min(0).max(4).optional(),
  modifiers: modifiers.optional(),
  heavyBarrels: z.boolean().optional(),
  dakCoax: z.boolean().optional(),
});
const factions = z.array(z.enum(["american", "german", "afrika_korps", "british_africa"])).max(4);
const point = z.object({ x: finite, y: finite });
const scatter = z.object({
  enabled: z.boolean().default(DEFAULT_SCATTER_FORMATION.enabled),
  preset: z
    .enum(["riflemen_us", "panzergrenadier_ak", "ranger_us", "riflemen_cover"])
    .default(DEFAULT_SCATTER_FORMATION.preset),
  formation: z
    .enum(["default", "cover", "bunched"])
    .default(DEFAULT_SCATTER_FORMATION.formation ?? "default"),
  directionalCover: z.boolean().default(DEFAULT_SCATTER_FORMATION.directionalCover ?? false),
  disabledModelIds: z.array(z.number().int()).max(200).default([]),
  targetModelId: z.number().int().nullable().default(DEFAULT_SCATTER_FORMATION.targetModelId),
  groundTarget: point.nullable().default(null),
  gunnerAngleDeg: finite.min(0).max(360).default(DEFAULT_SCATTER_FORMATION.gunnerAngleDeg),
});
const common = {
  v: z.literal(1),
  allowAllWeapons: z.boolean().default(DEFAULT_DPS_SETTINGS.allowAllWeapons),
  showFinalStand: z.boolean().default(DEFAULT_DPS_SETTINGS.showFinalStand),
};
const defaultSlot = () => ({ patch: config.latestPatch, unit: null });
const slot = z.object({ patch, unit: unit.nullable().default(null) });
const defaultSlots = (): [z.infer<typeof slot>, z.infer<typeof slot>] => [
  defaultSlot(),
  defaultSlot(),
];
const schema = z.discriminatedUnion("mode", [
  z.object({
    ...common,
    mode: z.literal("vs"),
    slots: z.tuple([slot, slot]).default(defaultSlots),
    filters: z.tuple([factions, factions]).default([[], []]),
    showDpsHealth: z.boolean().default(DEFAULT_DPS_SETTINGS.showDpsHealth),
  }),
  z.object({
    ...common,
    mode: z.literal("compare"),
    patch,
    attackers: z.array(unit).max(6).default([]),
    target: unit
      .extend({ id: id.default(DEFAULT_COMPARE_TARGET_IDS.infantry) })
      .nullable()
      .default(() => ({ id: DEFAULT_COMPARE_TARGET_IDS.infantry })),
    targetType: z.enum(["infantry", "other"]).default(DEFAULT_COMPARE_SETTINGS.targetType),
    filter: factions.default([]),
    scatter: scatter.default(() => scatter.parse({})),
    samples: z
      .union([z.literal(144), z.literal(576), z.literal(2025)])
      .default(DEFAULT_COMPARE_SETTINGS.samples as 576),
    fogOfWar: z.boolean().default(DEFAULT_COMPARE_SETTINGS.fogOfWar),
    pendingAttacker: id.nullable().optional(),
    preview: z
      .object({ attacker: z.number().int().min(0).max(5), weapon: id, range: finite.min(0) })
      .nullable()
      .default(null),
  }),
]);

export type SharedDpsSetup = z.infer<typeof schema>;
export type SharedDpsUnit = z.infer<typeof unit>;

const sameWeapon = (first: WeaponMember, second: WeaponMember) =>
  first.weapon_id === second.weapon_id &&
  first.hardpointIndex === second.hardpointIndex &&
  first.ebps?.id === second.ebps?.id;

const snapshotWeapon = (member: WeaponMember): z.infer<typeof addedWeapon> => ({
  id: member.weapon_id,
  count: member.num,
  entity: member.ebps?.id,
  hardpoint: member.hardpointIndex,
});

/** Supply the selected patch's default unit to save only changes to its loadout/settings. */
export const snapshotDpsUnit = (
  value?: CustomizableUnit,
  baseline?: CustomizableUnit,
): SharedDpsUnit | null => {
  if (!value) return null;
  const defaults = createDefaultCustomModifiers();
  const changed = Object.fromEntries(
    Object.entries(value.custom_modifiers ?? {}).filter(
      ([key, entry]) =>
        JSON.stringify(entry) !== JSON.stringify(defaults[key as keyof CustomModifiers]),
    ),
  );
  const saved: SharedDpsUnit = {
    id: value.id,
    weapons: value.weapon_member.map(snapshotWeapon),
    cover: value.cover as SharedDpsUnit["cover"],
    moving: value.is_moving ?? false,
    vet: value.veterancyLevel ?? 0,
    modifiers: Object.keys(changed).length ? changed : undefined,
    heavyBarrels: value.heavyBarrelsEnabled ?? false,
    dakCoax: value.dakCoaxUpgradeEnabled ?? false,
  };
  if (!baseline) return saved;
  const edits: NonNullable<SharedDpsUnit["weapons"]> = [];
  baseline.weapon_member.forEach((member, index) => {
    const current = value.weapon_member.find((candidate) => sameWeapon(candidate, member));
    if (!current) edits.push({ index, remove: true });
    else if (current.num !== member.num) edits.push({ index, count: current.num });
  });
  for (const member of value.weapon_member) {
    if (!baseline.weapon_member.some((candidate) => sameWeapon(candidate, member)))
      edits.push(snapshotWeapon(member));
  }
  saved.weapons = edits.length ? edits : undefined;
  const canonical = [
    ...baseline.weapon_member.filter((member) =>
      value.weapon_member.some((candidate) => sameWeapon(candidate, member)),
    ),
    ...value.weapon_member.filter(
      (member) => !baseline.weapon_member.some((candidate) => sameWeapon(candidate, member)),
    ),
  ];
  const order = value.weapon_member.map((member) =>
    canonical.findIndex((candidate) => sameWeapon(candidate, member)),
  );
  if (order.some((index, position) => index !== position)) saved.weaponOrder = order;
  const base = snapshotDpsUnit(baseline)!;
  for (const key of Object.keys(saved) as Array<keyof SharedDpsUnit>) {
    if (
      key !== "id" &&
      key !== "weapons" &&
      JSON.stringify(saved[key]) === JSON.stringify(base[key])
    )
      delete saved[key];
  }
  return saved;
};

/** Resolve every unit and weapon against the selected patch, never against URL-supplied stats. */
export const restoreDpsUnit = (
  saved: SharedDpsUnit | null,
  catalog: DpsUnitCatalog,
): CustomizableUnit | undefined => {
  if (!saved) return undefined;
  const value = catalog.createUnit(saved.id);
  if (!value) return undefined;
  const templates = value.weapon_member;
  const edits = new Map(
    (saved.weapons ?? []).flatMap((entry) =>
      "index" in entry ? [[entry.index, entry] as const] : [],
    ),
  );
  value.weapon_member = templates.flatMap((member, index) => {
    const edit = edits.get(index);
    if (edit && "remove" in edit) return [];
    return [{ ...member, num: edit && "count" in edit ? edit.count : member.num }];
  });
  for (const entry of saved.weapons ?? []) {
    if (!("id" in entry)) continue;
    const existing = value.weapon_member.findIndex(
      (member) =>
        member.weapon_id === entry.id &&
        member.hardpointIndex === entry.hardpoint &&
        (!entry.entity || member.ebps?.id === entry.entity),
    );
    if (existing >= 0) {
      value.weapon_member[existing] = { ...value.weapon_member[existing], num: entry.count };
      continue;
    }
    const template = templates.find(
      (member) =>
        member.weapon_id === entry.id &&
        member.hardpointIndex === entry.hardpoint &&
        (!entry.entity || member.ebps?.id === entry.entity),
    );
    if (template) {
      value.weapon_member.push({ ...template, num: entry.count });
      continue;
    }
    const mappedWeapon = catalog.data.weaponData.find((weapon) => weapon.id === entry.id);
    const entity =
      catalog.data.ebpsData.find((entity) => entity.id === entry.entity) ?? value.ebps_default;
    if (!mappedWeapon || !entity?.id) continue;
    value.weapon_member.push({
      ...mapWeaponMember(value.sbps, entity, mappedWeapon, entry.count),
      hardpointIndex: entry.hardpoint,
    });
  }
  if (saved.weaponOrder) {
    const order = saved.weaponOrder.filter((index) => index < value.weapon_member.length);
    value.weapon_member = [
      ...order.map((index) => value.weapon_member[index]),
      ...value.weapon_member.filter((_, index) => !order.includes(index)),
    ];
  }
  value.cover = saved.cover ?? value.cover;
  value.is_moving = saved.moving ?? value.is_moving;
  // COUNT veterancy is already included in the saved weapon-count overrides.
  value.veterancyLevel = saved.vet ?? value.veterancyLevel;
  value.custom_modifiers = {
    ...(value.custom_modifiers ?? createDefaultCustomModifiers()),
    ...JSON.parse(JSON.stringify(saved.modifiers ?? {})),
  };
  value.heavyBarrelsEnabled = saved.heavyBarrels ?? value.heavyBarrelsEnabled;
  value.dakCoaxUpgradeEnabled = saved.dakCoax ?? value.dakCoaxUpgradeEnabled;
  updateHealth(value);
  return value;
};

// This is the first released format. Keys are fixed by the format version;
// omitted values deliberately inherit today's defaults rather than historical ones.
const WIRE_KEYS = [
  "v",
  "mode",
  "patch",
  "slots",
  "unit",
  "attackers",
  "target",
  "targetType",
  "filters",
  "filter",
  "allowAllWeapons",
  "showFinalStand",
  "showDpsHealth",
  "scatter",
  "samples",
  "fogOfWar",
  "pendingAttacker",
  "preview",
  "attacker",
  "weapon",
  "range",
  "id",
  "weapons",
  "cover",
  "moving",
  "vet",
  "modifiers",
  "heavyBarrels",
  "dakCoax",
  "count",
  "entity",
  "hardpoint",
  "index",
  "remove",
  "enabled",
  "preset",
  "formation",
  "directionalCover",
  "disabledModelIds",
  "targetModelId",
  "groundTarget",
  "gunnerAngleDeg",
  "x",
  "y",
  "type",
  "value",
  "percentageValues",
  "accuracy",
  "scatterAccuracy",
  "damage",
  "penetration",
  "reload",
  "cooldownReload",
  "overallAttackSpeed",
  "burstLength",
  "burstShots",
  "armor",
  "hitpoints",
  "receivedAccuracy",
  "receivedDamage",
  "weaponOrder",
] as const;
const WIRE_CODES = new Map<string, string>(
  WIRE_KEYS.map((key, index) => [key, index.toString(36)]),
);

const mapWireKeys = (value: unknown, encode: boolean): unknown => {
  if (Array.isArray(value)) return value.map((entry) => mapWireKeys(entry, encode));
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => {
        const mapped = encode ? WIRE_CODES.get(key) : WIRE_KEYS[parseInt(key, 36)];
        if (!mapped || (!encode && WIRE_CODES.get(mapped) !== key))
          throw new Error("Invalid shared setup key");
        return [mapped, mapWireKeys(entry, encode)];
      }),
  );
};

const omitDefaults = (value: unknown, baseline: unknown): unknown => {
  if (JSON.stringify(value) === JSON.stringify(baseline)) return undefined;
  if (
    value &&
    baseline &&
    typeof value === "object" &&
    typeof baseline === "object" &&
    !Array.isArray(value) &&
    !Array.isArray(baseline)
  ) {
    const defaults = baseline as Record<string, unknown>;
    const entries = Object.entries(value).map(([key, entry]) => [
      key,
      omitDefaults(entry, defaults[key]),
    ]);
    const changed = entries.filter(([, entry]) => entry !== undefined);
    return changed.length ? Object.fromEntries(changed) : undefined;
  }
  return value;
};

const setupDefaults = (mode: SharedDpsSetup["mode"]) => ({
  v: 1,
  mode,
  ...DEFAULT_DPS_SETTINGS,
  ...(mode === "compare"
    ? {
        ...DEFAULT_COMPARE_SETTINGS,
        patch: config.latestPatch,
        attackers: [],
        target: { id: DEFAULT_COMPARE_TARGET_IDS.infantry },
        filter: [],
        scatter: DEFAULT_SCATTER_FORMATION,
        pendingAttacker: null,
        preview: null,
      }
    : { slots: defaultSlots(), filters: [[], []] }),
});

const MAX_SETUP_BYTES = 112_500;
const COMPRESSED_PREFIX = "z.";

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** Native compression keeps this out of the application bundle and needs no dependency. */
const transformBytes = async (bytes: Uint8Array<ArrayBuffer>, decompress: boolean) => {
  const stream = decompress
    ? new DecompressionStream("deflate")
    : new CompressionStream("deflate");
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  await Promise.all([
    (async () => {
      await writer.write(bytes);
      await writer.close();
    })(),
    (async () => {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > MAX_SETUP_BYTES) {
          await reader.cancel();
          throw new Error("Shared calculator setup is too large");
        }
        chunks.push(value);
      }
    })(),
  ]);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

/** A fragment keeps even large loadouts out of server requests and cache keys. */
export const encodeSharedDpsSetup = async (setup: SharedDpsSetup): Promise<string> => {
  const changes = omitDefaults(setup, setupDefaults(setup.mode)) as
    Record<string, unknown> | undefined;
  // A fresh calculator is already represented by its page URL.
  if (!changes) return "";
  if (setup.mode === "vs" && changes.slots) {
    changes.slots = setup.slots.map((slot) => omitDefaults(slot, defaultSlot()) ?? {});
  }
  const compact = mapWireKeys({ v: setup.v, mode: setup.mode, ...changes }, true);
  const bytes = new TextEncoder().encode(JSON.stringify(compact));
  const plain = toBase64Url(bytes);
  // The same compact format can be written without compression when necessary.
  if (typeof CompressionStream === "undefined" || typeof DecompressionStream === "undefined")
    return plain;
  try {
    const compressed = COMPRESSED_PREFIX + toBase64Url(await transformBytes(bytes, false));
    return compressed.length < plain.length ? compressed : plain;
  } catch {
    return plain;
  }
};

export const decodeSharedDpsSetup = async (
  encoded: string,
): Promise<SharedDpsSetup | undefined> => {
  if (encoded.length > 150000) return undefined;
  // Keep the saved URL intact if this browser cannot decode it, rather than
  // treating it as an invalid setup and replacing it with the defaults.
  if (encoded.startsWith(COMPRESSED_PREFIX) && typeof DecompressionStream === "undefined")
    throw new Error("This browser cannot decompress shared calculator links");
  try {
    const compressed = encoded.startsWith(COMPRESSED_PREFIX);
    const payload = compressed ? encoded.slice(COMPRESSED_PREFIX.length) : encoded;
    let bytes = Uint8Array.from(atob(payload.replace(/-/g, "+").replace(/_/g, "/")), (char) =>
      char.charCodeAt(0),
    );
    if (compressed) bytes = await transformBytes(bytes, true);
    const result = schema.safeParse(
      mapWireKeys(JSON.parse(new TextDecoder().decode(bytes)), false),
    );
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
};

export const hasSharedDpsSetup = (asPath: string | undefined): boolean =>
  new URLSearchParams(asPath?.split("#")[1] ?? "").has("setup");

export const readSharedDpsSetup = async (
  asPath: string | undefined,
  mode: SharedDpsSetup["mode"],
) => {
  const encoded = new URLSearchParams(asPath?.split("#")[1] ?? "").get("setup");
  const saved = encoded ? await decodeSharedDpsSetup(encoded) : undefined;
  return saved?.mode === mode ? saved : undefined;
};
