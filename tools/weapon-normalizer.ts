import { WeaponBag, WeaponData, WeaponsData } from "../src/coh3/coh3-types";

export type WeaponOwner =
  | "afrika_korps"
  | "american"
  | "british"
  | "british_africa"
  | "common"
  | "dev"
  | "german";

export type WeaponCategory =
  | "ballistic_weapon"
  | "explosive_weapon"
  | "campaign"
  | "flame_throwers"
  | "small_arms"
  | "special";

export interface Accuracy {
  near: number;
  far: number;
  mid: number;
}

export interface NormalizedWeapon {
  owner: WeaponOwner;
  category: WeaponCategory | string | null;
  type: string;
  subtype: string;
  pbgid: number;
  accuracy: Accuracy;
  displayName: string;
  referenceName: string;
  iconName: string;
  rawWeaponBag: WeaponBag | Record<string, unknown> | null;
}

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// ensure we can serialize the normalized data
export type NullableNormalizedWeapon = Nullable<NormalizedWeapon>;

export function isWeaponOwner(value: string): value is WeaponOwner {
  return (
    value === "afrika_korps" ||
    value === "american" ||
    value === "british" ||
    value === "british_africa" ||
    value === "common" ||
    value === "dev" ||
    value === "german"
  );
}

export function isWeaponCategory(value: string): value is WeaponCategory {
  return (
    value === "ballistic_weapon" ||
    value === "explosive_weapon" ||
    value === "campaign" ||
    value === "flame_throwers" ||
    value === "small_arms" ||
    value === "special"
  );
}

export function getWeaponProperties(path: string[]): {
  owner: NullableNormalizedWeapon["owner"];
  category: NullableNormalizedWeapon["category"];
  type: NullableNormalizedWeapon["type"];
  subtype: NullableNormalizedWeapon["subtype"];
  referenceName: NullableNormalizedWeapon["referenceName"];
} | null {
  let category: NullableNormalizedWeapon["category"] = null;
  let type: NullableNormalizedWeapon["type"] = null;
  let subtype: NullableNormalizedWeapon["subtype"] = null;
  let referenceName: NullableNormalizedWeapon["referenceName"] = null;

  if (!isWeaponOwner(path[0])) {
    console.log(`Provided weapon owner was not valid. Provided weapon owner: "${path[0]}"`);
    return null;
  }

  // TODO: Find a less flimsy and terrible way to do this
  if (path.length === 5) {
    // we have a subtype
    category = path[1];
    type = path[2];
    subtype = path[3];
    referenceName = path[4];
  } else if (path.length === 4) {
    // we have a subtype
    category = path[1];
    type = path[2];
    referenceName = path[3];
  } else if (path.length === 3) {
    category = path[1];
    referenceName = path[2];
  } else {
    referenceName = path[1];
  }

  return { owner: path[0], category, type, subtype, referenceName };
}

/**
 *
 * @param weaponData Raw weapon data from the game
 * @param locstrings a map of locstring keys to their values, which are usually human-readable names for the weapons
 * @returns a flattened array of weapons
 */
export function normalizeWeapons(
  weaponData: Nullable<Partial<WeaponsData>>,
  locstrings?: Record<string, string>,
): NullableNormalizedWeapon[] {
  const weapons: NullableNormalizedWeapon[] = [];
  // if we find this property in a node, we will stop flattening and return the data
  const targetProperty = "weapon_bag";

  function flattenNode(node: Record<string, unknown>, path: string[] = []) {
    if (node && typeof node === "object") {
      if (node.hasOwnProperty(targetProperty)) {
        const weaponRoot = node as Partial<WeaponData> | undefined;
        const weaponBag = weaponRoot?.[targetProperty];

        if (!weaponRoot || !weaponBag) return null;

        const pbgid = weaponRoot?.pbgid;
        const accuracy = weaponBag?.["accuracy"];
        const displayNameLocstring = weaponBag?.ui_name?.locstring.value;
        const displayName = locstrings?.[displayNameLocstring ?? ""] ?? null;
        const iconName = weaponBag?.icon_name ?? null;

        const basicProperties = getWeaponProperties(path);

        if (!basicProperties) return null;

        const normalizedWeapon: NullableNormalizedWeapon = {
          owner: basicProperties?.owner,
          category: basicProperties?.category,
          type: basicProperties?.type,
          subtype: basicProperties?.subtype,
          referenceName: basicProperties?.referenceName,
          pbgid: pbgid ?? null,
          accuracy: accuracy ?? null,
          rawWeaponBag: weaponBag ?? null,
          displayName,
          iconName,
        };

        weapons.push(normalizedWeapon);
      } else {
        Object.entries(node).forEach(([key, value]) => {
          flattenNode(value as Record<string, unknown>, [...path, key]);
        });
      }
    }
  }

  flattenNode(weaponData);

  return weapons;
}
