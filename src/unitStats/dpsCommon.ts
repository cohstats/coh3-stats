import { getIconsPathOnCDN } from "../utils";
import { EbpsType } from "./mappingEbps";
import { SbpsType } from "./mappingSbps";
import { WeaponStatsType, WeaponType } from "./mappingWeapon";
import { getFactionIcon } from "./unitStatsLib";
import { getSingleWeaponDPS } from "./weaponLib";

type WeaponMember = {
  weapon_id: string; // Weapon id
  num: number;
  unit: string;
  crew_size: number;
  sbps: SbpsType;
  ebps: EbpsType;
  weapon: WeaponType;
  image: string;
  label: string;
  description: string;
  value: string;
};

const mapWeaponMember = (
  sbps_selected: SbpsType,
  ebps_selected: EbpsType,
  weapon: WeaponType,
  loadout_num = 1,
) => {
  const member = {
    weapon_id: weapon.id, // Weapon id
    num: loadout_num,
    unit: ebps_selected.id,
    crew_size: ebps_selected.crew_size,
    sbps: sbps_selected,
    ebps: ebps_selected,
    weapon: weapon,
    image: (weapon as any).image, // intermediate solution
    label: weapon.id,
    description: weapon.description,
    value: weapon.id,
  };
  //   (clone as any).unit = loadout.id;
  if (weapon.icon_name != "") member.image = getIconsPathOnCDN("icons/" + weapon.icon_name);
  else member.image = getDefaultWeaponIcon(weapon.parent);

  //   loadoutUnit.push(clone as any);
  return member;
};

type CustomizableUnit = {
  id: string; // filename  -> eg. panzergrenadier_ak
  screen_name: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\screen_name
  path: string; // path to object
  faction: string; // from folder structure races\[factionName]
  weapon_member: WeaponMember[]; // set of weapons + amount
  def_weapon_member: WeaponMember[];
  unit_type: string; // folder Infantry | vehicles | team_weapons | buildings
  help_text: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\help_text
  icon_name: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\icon_name
  faction_icon: string;
  cover: string;
  is_moving: boolean;
  hitpoints: number;
  type_icon: string;
  target_size: number;
  armor: number;
  value: string; // must have value, otherwise multiselect will not work
  label: string; // For drop down
  image: string;
  description: string;
  health: number;
  def_member: string;
  def_damage_type: string;
  sbps: SbpsType;
};

export const mapCustomizableUnit = (
  sbpsSelected: SbpsType,
  ebps: EbpsType[],
  weapons: WeaponType[],

  // weapons?: WeaponType[],
) => {
  // Initilaize
  const custUnit: CustomizableUnit = {
    id: sbpsSelected.id, // filename  -> eg. panzergrenadier_ak
    screen_name: sbpsSelected.ui.screenName || "No text found", // sbpextensions\squad_ui_ext\race_list\race_data\info\screen_name
    path: sbpsSelected.path, // path to object
    faction: sbpsSelected.faction, // from folder structure races\[factionName]
    weapon_member: [], // weapon_member owning one weapon each
    unit_type: sbpsSelected.unitType, // folder Infantry | vehicles | team_weapons | buildings
    help_text: sbpsSelected.ui.helpText, // sbpextensions\squad_ui_ext\race_list\race_data\info\help_text
    //iconName: slash("/icons/" + sbpsSelected.ui.iconName + ".png") || "icon", // sbpextensions\squad_ui_ext\race_list\race_data\info\icon_name
    icon_name: getIconsPathOnCDN("icons/" + sbpsSelected.ui.iconName) || "icon",
    type_icon: "",
    faction_icon: getFactionIcon(sbpsSelected.faction),
    hitpoints: 0,
    cover: "",
    is_moving: false,
    target_size: 1,
    armor: 1,
    image: getFactionIcon(sbpsSelected.faction),
    description: sbpsSelected.ui.screenName,
    label: sbpsSelected.id,
    value: sbpsSelected.id,
    def_damage_type: "",
    def_weapon_member: [], // default member with weapon
    def_member: "", // required to get health of non weapon vehicles. Loadout[0]
    health: 0,
    sbps: sbpsSelected,
  };

  if (sbpsSelected.ui.symbolIconName != "")
    custUnit.type_icon = getIconsPathOnCDN("icons/" + sbpsSelected.ui.symbolIconName);

  // default member
  if (sbpsSelected.loadout.length > 0) {
    let folder_list = sbpsSelected.loadout[0].type.split("/");
    if (sbpsSelected.unitType == "team_weapons" && sbpsSelected.loadout.length > 1)
      folder_list = sbpsSelected.loadout[1].type.split("/");
    custUnit.def_member = folder_list[folder_list.length - 1];
  }

  if (ebps) {
    // Get loadouts
    custUnit.weapon_member = getSbpsWeapons(sbpsSelected, ebps, weapons);
    custUnit.def_weapon_member = [...custUnit.weapon_member];

    // default weapon type
    if (custUnit.weapon_member.length > 0)
      custUnit.def_damage_type = (custUnit.weapon_member[0] as any).parent;

    // Armor
    const ebpsUnit = ebps.find((unit) => unit.id == custUnit.def_member);
    custUnit.armor =
      ebpsUnit?.health.armorLayout?.armor || ebpsUnit?.health.armorLayout?.frontArmor || 1;
    if (custUnit.unit_type == "vehicles")
      custUnit.armor = ebpsUnit?.health.armorLayout.frontArmor || 1;

    // squad hitpoints
    const def_ebps = ebps.find((unit) => unit.id == custUnit.def_member);
    if (def_ebps) {
      custUnit.hitpoints = def_ebps.health.hitpoints;
      custUnit.target_size = def_ebps.health.targetSize;
    } else custUnit.hitpoints = 80;
  }

  return custUnit;
};

export const getSbpsWeapons = (sbps: SbpsType, ebpsList: EbpsType[], weapons: WeaponType[]) => {
  const loadoutUnit: WeaponMember[] = [];
  let crew_demand = 0;
  // loop through loadout to get path to unit entity
  for (const loadout of sbps.loadout) {
    const type = loadout.type.split("/");
    const unit_ebps = ebpsList.find((unit) => unit.id == type[type.length - 1]);

    if (!unit_ebps) continue;

    let num = loadout.num;
    if (crew_demand > 0) num = num - crew_demand;

    crew_demand = unit_ebps.crew_size;

    // loop throup hardpoints get weapon ebps
    for (const weaponRef of unit_ebps.weaponRef) {
      // find weapon ebps
      const refPath = weaponRef.ebp.split("/");

      const weapon_ebps = ebpsList.find((wEbp) => wEbp.id == refPath[refPath.length - 1]);

      // find referenced weapon template
      const weapon = weapons.find((gun) => gun.id == weapon_ebps?.weaponId);

      // ignore loadout when no damage dealing weapon found
      if (!weapon || (weapon as WeaponType).weapon_bag.damage_max == 0) continue;

      const weaponMember = mapWeaponMember(sbps, unit_ebps, weapon, num);
      loadoutUnit.push(weaponMember);
    }

    if (unit_ebps.weaponId != "") {
      // special case (e.g. for hmgs) weapon epbs is referenced directly
      const weapon = weapons.find((gun) => gun.id == unit_ebps.weaponId);

      // ignore loadout when no damage dealing weapon found
      if (!weapon || (weapon as WeaponType).weapon_bag.damage_max == 0) continue;

      const weaponMember = mapWeaponMember(sbps, unit_ebps, weapon, loadout.num);
      loadoutUnit.push(weaponMember);
    }
  } // loadout ende

  return loadoutUnit;
};

export const getSbpsUpgrades = (sbps: SbpsType, ebpsList: EbpsType[], weapons: WeaponType[]) => {
  const loadoutMember: WeaponMember[] = [];
  const weapon_ebps_list: EbpsType[] = [];

  if (sbps.unitType != "infantry") return [];

  for (const ebps of ebpsList)
    if (
      (sbps.faction == ebps.faction ||
        (sbps.faction.includes("british") && ebps.faction.includes("british"))) &&
      ["rifle", "light_machine_gun", "sub_machine_gun", "infantry_anti_tank_weapon"].includes(
        ebps.unitType,
      ) &&
      !ebps.id.includes("_coaxial") &&
      !ebps.id.includes("_hull") &&
      !ebps.id.includes("_halftrack") &&
      !ebps.id.includes("_kettenkrad")
    )
      weapon_ebps_list.push(ebps);

  // loop through loadout to get path to unit entity
  for (const loadout of sbps.loadout) {
    const type = loadout.type.split("/");
    const unit_ebps = ebpsList.find((unit) => unit.id == type[type.length - 1]);

    if (!unit_ebps) continue;

    for (const weapon_ebps of weapon_ebps_list) {
      // find referenced weapon template
      const weapon = weapons.find((gun) => gun.id == weapon_ebps?.weaponId);

      // ignore loadout when no damage dealing weapon found
      if (!weapon || weapon.weapon_bag.damage_max == 0 || weapon.weapon_bag.accuracy_near >= 1)
        continue;

      const weaponMember = mapWeaponMember(sbps, unit_ebps, weapon, 1);
      loadoutMember.push(weaponMember);
    }
  }
  return loadoutMember;
};

export const getCoverMultiplier = (coverType: string, weaponBag: WeaponStatsType) => {
  const cover = {
    accuracy_multiplier: weaponBag.cover_table_tp_defcover_accuracy_multiplier, // opponent cover penalty
    damage_multiplier: weaponBag.cover_table_tp_defcover_damage_multiplier,
    penetration_multiplier: weaponBag.cover_table_tp_defcover_penetration_multiplier,
  };

  const accuracy_mp = (weaponBag as any)[
    "cover_table_tp_" + coverType + "_cover_accuracy_multiplier"
  ];
  if (accuracy_mp) cover.accuracy_multiplier = accuracy_mp;

  const damage_mp = (weaponBag as any)[
    "cover_table_tp_" + coverType + "_cover_damage_multiplier"
  ];
  if (accuracy_mp) cover.damage_multiplier = damage_mp;

  const penetration_mp = (weaponBag as any)[
    "cover_table_tp_" + coverType + "_cover_penetration_multiplier"
  ];
  if (penetration_mp) cover.penetration_multiplier = penetration_mp;

  return cover;
};

export const getDefaultWeaponIcon = (parent_folder: string) => {
  const image = "/unitStats/weaponClass/";

  switch (parent_folder) {
    case "sub_machine_gun":
      return image + "m1_thompson_sub_machine_gun.png";
      break;
    case "light_machine_gun":
      return image + "weapon_lmg_mg34.png";
      break;
    case "heavy_machine_gun":
      return image + "hmg_mg42_ger.png";
      break;
    case "rifle":
    case "sidearm":
      return image + "weapon_dp_28_lmg.png";
      break;
    case "mortar":
      return image + "mortar.png";
      break;
    case "anti_tank_gun":
      return image + "at_gun_icn.png";
      break;
    case "tank_gun":
    case "tungsten_round_upgrade":
      return image + "tank_kwk.png";
      break;
    default:
      return "";
  }
};

export const getWeaponDPSData = (units: CustomizableUnit[]) => {
  const dpsSet: any[] = [];

  if (units.length == 0) return dpsSet;

  // we only have two units so we keep it simple -> No generic loop stuff
  if (units[0]) dpsSet[0] = getCombatDps(units[0], units[1]);

  if (units[1]) dpsSet[1] = getCombatDps(units[1], units[0]);

  return dpsSet;
};

export const updateHealth = (unit: CustomizableUnit) => {
  let health = 0;
  if (unit.unit_type != "vehicles")
    for (const member of unit.weapon_member) {
      health += unit.hitpoints * member.num * Math.max(member.crew_size, 1);
    }
  // is vehicle
  else {
    health += unit.hitpoints;
  }
  unit.health = health;
};

export const getDpsVsHealth = (
  ebps: EbpsType[],
  unit1: CustomizableUnit,
  unit2?: CustomizableUnit,
) => {
  const dpsData: any[] = getCombatDps(unit1, unit2);
  let health = unit1.health;

  // compute opponents health
  if (unit2) health = unit2.health;

  for (const dps of dpsData) dps.y = (dps.y / health) * 100;

  return dpsData;
};

export const getCombatDps = (unit1: CustomizableUnit, unit2?: CustomizableUnit) => {
  // compute dps for first squad
  let dpsTotal: any[] = [];

  // compute total dps for complete loadout
  unit1.weapon_member.forEach((ldout) => {
    const weapon_member = ldout;
    const weaponDps = [];

    const range_min = weapon_member.weapon.weapon_bag.range_min;
    const range_max = weapon_member.weapon.weapon_bag.range_max;
    // opponent default values

    for (let distance = range_min; distance <= range_max; distance++) {
      const dps = getSingleWeaponDPS(weapon_member, distance, unit1.is_moving, unit2);
      weaponDps.push({ x: distance, y: dps });
    }

    dpsTotal = addDpsData(dpsTotal, weaponDps);
  });

  return dpsTotal;
};

// sums up two dps lines
export const addDpsData = (dps1: any[], dps2: any[]) => {
  if (dps1.length == 0) return dps2;
  // set with {x,y} touples
  const newSet: any[] = [];

  let ind_2 = 0; // loop only once through second line
  for (let ind_1 = 0; ind_1 < dps1.length; ind_1++) {
    const point1 = dps1[ind_1];

    for (ind_2; ind_2 < dps2.length; ind_2++) {
      const point2 = dps2[ind_2];

      // ideal case. Both weapons address the same range. simply merge
      // and check the next points.
      if (point1.x == point2.x || point1.x < point2.x) {
        newSet.push(mergePoints(point1, point2));
        if (point1.x == point2.x) ind_2++;
        break;
      }

      // merge into range of weapon2
      if (point1.x > point2.x) newSet.push(mergePoints(point2, point1));
    }
  }

  return newSet;
};

export const mergePoints = (xPoint: any, yPoint: any) => {
  return { x: xPoint.x, y: xPoint.y + yPoint.y };
};

export type { WeaponMember, CustomizableUnit };
