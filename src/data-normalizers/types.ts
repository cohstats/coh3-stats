import { WeaponBag } from "../coh3/coh3-types";

export type Owner =
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
  owner: Owner;
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

export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// ensure we can serialize the normalized data
export type NullableNormalizedWeapon = Nullable<NormalizedWeapon>;

export function isWeaponOwner(value: string): value is Owner {
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
