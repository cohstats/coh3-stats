import { BattlegroupResolvedType, BattleGroupUpgradeType } from "./battlegroup";
import { EbpsType } from "./mappingEbps";
import { SbpsType } from "./mappingSbps";

type ItemType = EbpsType | SbpsType | BattlegroupResolvedType;

interface Override {
  /** */
  predicate: (item: ItemType) => boolean;
  /** */
  mutator: (item: ItemType) => void;
  /** */
  validator?: (item: ItemType) => boolean;
}

const bgWorkaround = (description: string, override: Override) => {
  bgWorkarounds.set(description, override);
};

const bgWorkarounds = new Map<string, Override>();

const ebpsWorkaround = (description: string, override: Override) => {
  ebpsWorkarounds.set(description, override);
};

const ebpsWorkarounds = new Map<string, Override>();

// ------------------ COMMON SPBS CASES ------------------- //

/**
 * 🗺️ Centralized Mapping Table
 * Maps ability.id (key) to the desired array of spawnItems (value).
 */
export const SpawnItemMappings: { [abilityId: string]: string[] } = {
  // --- Afrika Korps ---
  armored_support_flame_p3_ak: ["panzer_iii_flame_ak"],
  armored_support_command_p4_ak: ["panzer_iv_command_ak"],
  italian_combined_arms_bersaglieri_ak: ["bersaglieri_ak"],
  italian_combined_arms_semovente_ak: ["semovente_75_18_ak"],
  italian_combined_arms_m13_40_ak: ["m13_40_ak"],
  italian_infantry_double_l640_ak: ["l6_40_ak"],
  italian_infantry_guastatori_ak: ["guastatori_ak"],
  italian_infantry_cannone_da_105_ak: ["howitzer_cannone_da_105_ak"],
  infiltration_left_1_vampire_ht_goliath_ak: ["halftrack_250_vampire_ak", "goliath_ak"],
  panzerjager_kommand_elefant_ak: ["elefant_tank_destroyer_ak"],
  kriegsmarine_infantry_ak: ["kriegsmarine_infantry_ak"],
  elite_forces_tiger_ace_dummy_ak: ["tiger_ace_ak"],

  // --- British ---
  british_air_and_sea_left_2a_centaur_cs_uk: ["centaur_africa_uk"],
  british_air_and_sea_right_1_commandos_uk: ["commando_africa_uk"],
  british_air_and_sea_right_2a_pack_howitzer_team_uk: ["pack_howitzer_75mm_africa_uk"],
  british_air_and_sea_right_2b_commando_lmg_team_uk: ["commando_lmg_africa_uk"],
  british_armored_right_2_crusader_aa_uk: ["crusader_aa_africa_uk"],
  british_armored_left_2_churchill: ["churchill_africa_uk"],
  british_armored_left_3b_churchill_black_prince_uk: ["churchill_black_prince_africa_uk"],
  artillery_gurkhas_uk: ["gurkhas_africa_uk"],
  artillery_4_2_inch_heavy_mortar_uk: ["mortar_heavy_4_2_africa_uk"],
  artillery_bl_5_5_heavy_artillery_uk: ["howitzer_bl_5_5_africa_uk"],
  australian_defense_australian_light_infantry_uk: ["australian_light_infantry_africa_uk"],
  australian_defense_archer_tank_destroyer_call_in_uk: ["archer_africa_uk"],
  australian_defense_2pdr_at_gun_uk: ["at_gun_2pdr_africa_uk"],
  canadian_shock_canadian_shock_troops_uk: ["canadian_heavy_infantry_africa_uk"],
  canadian_shock_churchill_croc_uk: ["churchill_crocodile_africa_uk"],
  polish_cavalry_polish_lancer_uk: ["polish_lancer_africa_uk"],
  polish_cavalry_callin_towed_land_mattress_uk: ["land_mattress_africa_uk"],
  polish_cavalry_production_unlock_sherman_firefly_uk: ["sherman_firefly_africa_uk"],
  special_services_commandos_callin_uk: ["ssb_africa_uk"],
  special_services_cwt_lrdg_truck_callin_uk: ["cwt_lrdg_truck_africa_uk_uk"],
  special_services_sniper_callin_uk: ["ssb_sniper_africa_uk"],

  // --- American ---
  airborne_right_1a_pathfinders_us: ["pathfinder_us"],
  airborne_right_1b_paradrop_hmg_us: ["hmg_30cal_paradrop_us"],
  airborne_right_2_paratrooper_us: ["paratrooper_us"],
  airborne_right_3_paradrop_at_gun_us: ["at_gun_57mm_paradrop_us"],
  armored_left_2b_recovery_vehicle_us: ["recovery_vehicle_us"],
  armored_right_2a_scott_us: ["scott_us"],
  armored_right_sherman_easy_8_production_unlock_us: ["sherman_easy_8_us"],
  special_operations_left_1a_m29_weasal_us: ["m29_weasal_us"],
  special_operations_left_1b_m29_weasal_with_pack_howitzer: [
    "m29_weasal_us",
    "pack_howitzer_75mm_us",
  ],
  special_operations_left_3_whizbang_us: ["sherman_whizbang_us"],
  special_operations_right_2_devils_brigade_us: ["ssf_commandos_us"],
  infantry_left_1_rifleman_convert_to_ranger_us: ["ranger_us"],
  infantry_right_1a_artillery_observers_us: ["artillery_observers_us"],
  infantry_right_2_105mm_howitzer_us: ["howitzer_105mm_us"],
  special_weapons_50cal_hmg_passive_us: ["hmg_50cal_us"],
  special_weapons_assault_halftrack_m3_callin_us: ["halftrack_assault_us"],
  special_weapons_pershing_us: ["pershing_us"],
  special_weapons_at_gun_3in_m5_us: ["at_gun_3in_m5_us"],
  partisan_resistance_fighter_callin_us: ["resistance_fighters_battlegroup_partisans"],
  partisan_saboteur_callin_us: ["saboteurs_battlegroup_partisan"],
  french_infantry_callin_us: ["french_infantry_us"],
  french_maginot_dummy_us: ["tourelle_emplacement_us"],
  french_production_unlock_char_b1_us: ["char_b1_us"],

  // --- German ---
  breakthrough_right_3a_assault_group_ger: ["stormtrooper_ger", "halftrack_ger"],
  breakthrough_left_1b_truck_2_5_ger: ["truck_2_5_cargo_ger"],
  breakthrough_left_2b_panzer_iv_cmd_ger: ["panzer_iv_cmd_ger"],
  breakthrough_left_3_tiger_ger: ["tiger_ger"],
  luftwaffe_right_2_fallschirmjagers_ger: ["fallschirmjagers_ger"],
  luftwaffe_left_1b_fallschirmpioneers_ger: ["fallschirmpioneers_ger"],
  luftwaffe_left_2b_combat_group_ger: ["wirbelwind_ger", "jaeger_ger"],
  luftwaffe_left_2a_weapon_drop_ger: ["at_gun_lg40_ger"],
  luftwaffe_left_3_88mm_at_gun_ger: ["at_gun_88mm_emplacement_ger"],
  mechanized_right_2a_stug_assault_group_ger: ["stug_iii_d_ger"],
  mechanized_left_2b_8_rad_ger: ["armored_car_8_rad_ger"],
  mechanized_right_3_panther_ger: ["panther_ger"],
  mechanized_left_3a_wespe_ger: ["wespe_ger"],
  coastal_left_1_coastal_reserve_ger: ["coastal_reserves_ger"],
  coastal_artillery_officer_ger: ["coastal_officer_ger"],
  coastal_obice_ger: ["howitzer_obice_210_ger"],
  terror_king_tiger_ger: ["king_tiger_sdkfz_182_ger"],
  last_stand_callin_borgward_iv_ger: ["borgward_iv_ger"],
  last_stand_convert_sturmpioneers_ger: ["sturmpioneer_ger"],
  siegebreakers_firestorm_doctrine_dummy_ger: ["halftrack_flame_ger"],
  siegebreakers_siege_camp_spawn_ger: ["bunker_mortar_autobuild_ger"],
  siegebreakers_production_unlock_sturmtiger_ger: ["sturmtiger_ger"],
};

/**
 * 🛠️ Single, Reusable Upgrade Mutator Function
 * Checks the lookup table for the ability ID and applies the appropriate spawnItems.
 * Handles the single custom case for manpower cost.
 *
 * @param upg The Battlegroup Upgrade item to modify.
 */
function applyBattlegroupUpgrade(upg: BattleGroupUpgradeType) {
  const abilityId = upg.ability.id;

  // 1. Handle the one-off custom case for cost change
  //if (abilityId === "australian_defense_australian_light_infantry_uk") {
  //  upg.ability.cost.manpower = 280;
  // Fall through to set spawnItems as well
  //}

  // 2. Look up the spawn items and apply if found
  const spawnItems = SpawnItemMappings[abilityId];
  if (spawnItems) {
    upg.spawnItems = spawnItems;
  }
}

// --------------------- BATTLEGROUPS --------------------- //

const setBattlegroupsWorkarounds = () => {
  /* ----------------------- DAK BATTLEGROUPS ----------------------- */

  // ---
  bgWorkaround("Modify Afrika Korps - Armored Support BG Call-Ins", {
    predicate: (item) => item.faction === "races/afrika_korps" && item.id === "armored_support",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      //
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Armored Warfare branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify Afrika Korps - Italian Combined Arms BG Call-Ins", {
    predicate: (item) =>
      item.faction === "races/afrika_korps" && item.id === "italian_combined_arms",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Combined Arms Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Italian Armor Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify Afrika Korps - Italian Infantry BG Call-Ins", {
    predicate: (item) => item.faction === "races/afrika_korps" && item.id === "italian_infantry",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Field Engineering Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Defensive Warfare Branch (no switch case needed, but still iterate).
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify Afrika Korps - Battlefield Espionage BG Call-Ins", {
    predicate: (item) => item.faction === "races/afrika_korps" && item.id === "subterfuge",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Infiltration Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Disruption Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify Afrika Korps - Panzerjäger Kommand BG Call-Ins", {
    predicate: (item) =>
      item.faction === "races/afrika_korps" && item.id === "panzerjager_kommand",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Stalling Tactics Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Tank Hunting Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // --- Kriegsmarine BG - Introduced at 2.2.0 (Scarlet Bison).
  bgWorkaround("Modify Afrika Korps - Kriegsmarine BG Call-Ins", {
    predicate: (item) => item.faction === "races/afrika_korps" && item.id === "kriegsmarine",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Off-Shore Support Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Logistics Operations Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // --- Elite Forces BG - Introduced at 2.4.0.
  bgWorkaround("Modify Afrika Korps - Elite Forces BG Call-Ins", {
    predicate: (item) => item.faction === "races/afrika_korps" && item.id === "elite_forces",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Off-Shore Support Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Logistics Operations Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });

  /* ----------------------- UKF BATTLEGROUPS ----------------------- */

  // ---
  bgWorkaround("Modify British - Air and Sea BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "british_air_and_sea",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Royal Navy Support branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Royal Air Force branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify British - British Armored BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "british_armored",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Heavy Armor Support
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Field Support and Logistics Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify British - Indian Artillery BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "indian_artillery",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Infantry Assault Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Artillery Support Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify British - Australian Defense BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "australian_defense",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Logistical Supremacy Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Frontline Defenders Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify British - Canadian Shock BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "canadian_shock",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Shock Assault Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Incendiary Weapons Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // --- Polish Cavalry BG - Introduced at 2.2.0 (Scarlet Bison).
  bgWorkaround("Modify British - Polish Cavalry BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "polish_cavalry",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Army In Exile Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Rocketry Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // --- Special Service BG - Introduced at 2.4.0 (Scarlet Bison).
  bgWorkaround("Modify British - Special Service BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "special_services",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Ungentlemanly Warfare Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Reconnaissance-in-Force Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });

  /* ----------------------- USF BATTLEGROUPS ----------------------- */

  // ---
  bgWorkaround("Modify American - Airborne BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "airborne",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Aerial Support Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Paradropped Infantry Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify American - Armored BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "armored",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Engineering Corp Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Armored Doctrine Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify American - Special Operations BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "special_operations",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Combat Support Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Combat Operations Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify American - Advanced Infantry BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "infantry",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Infantry Operations Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Field Ordenance Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify American - Heavy Weapons BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "special_weapons",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Weapons Teams Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Cavalry Support Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // --- Partisans BG - Introduced at 2.2.0 (Scarlet Bison).
  bgWorkaround("Modify American - Partisans BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "partisans",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Weapons Teams Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Cavalry Support Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // --- Free French BG - Introduced at 2.4.0.
  bgWorkaround("Modify American - Free French BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "french",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Methodical Battle Doctrine Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Defense in Depth Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });

  /* ----------------------- WEHR BATTLEGROUPS ----------------------- */

  // ---
  bgWorkaround("Modify German - Breakthrough BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "breakthrough",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Assault Forces Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Armored Offensive Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify German - Luftwaffe BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "luftwaffe",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Luftwaffe Air-to-Ground Support Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Luftwaffe Field Support Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify German - Mechanized BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "mechanized",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Mechanized Armor Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Mechanized Support Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify German - Italian Coastal BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "coastal",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      item.uiParent.iconName = "races/german/battlegroups/coastal_ger_icon";
      // Heavy Fortifications Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Coastal Forces Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // ---
  bgWorkaround("Modify German - Terror BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "terror",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Terror Tactics Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Weapon Superiority Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // --- Last Stand BG - Introduced at 2.2.0 (Scarlet Bison).
  bgWorkaround("Modify German - Last Stand BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "last_stand",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Desperate Battle Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Defense In Depth Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
  // --- Siege Breaker BG - Introduced at 2.4.0.
  bgWorkaround("Modify German - Siege Breaker BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "siegebreakers",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Siegeworks Branch.
      item.branches.LEFT.upgrades.forEach(applyBattlegroupUpgrade);
      // Vanguard Tactics Branch.
      item.branches.RIGHT.upgrades.forEach(applyBattlegroupUpgrade);
    },
  });
};

// --------------------- EBPS --------------------- //

const setEbpsWorkarounds = () => {
  ebpsWorkaround("Modify American - Barracks Icon", {
    predicate: (item) => item.faction === "american" && item.id === "barracks_us",
    mutator: (item) => {
      item = item as EbpsType;
      item.ui.iconName = "races/american/buildings/barracks_us";
    },
  });
};

setBattlegroupsWorkarounds();
setEbpsWorkarounds();

//upgrade state tree to weapon map
export type UpgradeStateTreeWeapon = {
  weaponId: string;
  count?: number;
};

export const UpgradeStateTreeToWeaponMap: Record<string, UpgradeStateTreeWeapon[]> = {
  m13_40_hull_gun_ak: [{ weaponId: "breda_38_hull_m13_40_ak", count: 1 }],
  mg34_panzer_ak: [{ weaponId: "mg34_panzer_iii_ak", count: 1 }],
  mg42_tiger_ak: [{ weaponId: "mg34_panzer_iii_ak", count: 1 }],
  hmg_greyhound_us: [{ weaponId: "50cal_greyhound_us", count: 1 }],
  hmg_hellcat_us: [{ weaponId: "50cal_hellcat_us", count: 1 }],
  hmg_sherman: [{ weaponId: "50cal_sherman_us", count: 1 }],
  hmg_sherman_easy8_us: [{ weaponId: "50cal_sherman_us", count: 1 }],
  mg42_panzer_ger: [{ weaponId: "mg42_panzer_iv_ger", count: 1 }],
  mg42_stug_ger: [{ weaponId: "mg42_stug_iii_ger", count: 1 }],
  mg42_tiger_ger: [{ weaponId: "mg34_tiger_ger", count: 1 }],
};

export const getUpgradeStateTreeWeapons = (stateTree?: string): UpgradeStateTreeWeapon[] => {
  if (!stateTree) return [];
  return UpgradeStateTreeToWeaponMap[stateTree] ?? [];
};

export type StateTreeSpawnWeapon = {
  pbg: string;
  count?: number;
  replacesNormalWeapon?: boolean;
};

export type StateTreeSpawnMapping = {
  upgrades?: string[];
  weapons?: StateTreeSpawnWeapon[];
};

export const StateTreeToSpawnMap: Record<string, StateTreeSpawnMapping> = {
  panzerjaeger_weapon_spawn: {
    weapons: [
      {
        pbg: "ebps/races/afrika_korps/weapons/ballistic_weapon/infantry_anti_tank_weapon/w_panzerbuchse39_at_rifle_ak",
        count: 2,
        replacesNormalWeapon: true,
      },
    ],
  },
  add_bazooka_bazooka_team_us: {
    upgrades: ["bazooka_bazooka_team_us"],
  },
  toggle_lmg_bazooka_ssf_spawn: {
    upgrades: ["m1941_lmg_special_operations_us"],
  },
  spawn_equip_lmg_commando_uk: {
    weapons: [
      {
        pbg: "ebps/races/british/weapons/small_arms/machine_guns/light_machine_gun/w_vickers_k_lmg_uk",
        count: 1,
        replacesNormalWeapon: true,
      },
    ],
  },
  add_bazooka_guards_uk: {
    weapons: [
      {
        pbg: "ebps/races/american/weapons/ballistic_weapon/infantry_anti_tank_weapon/w_bazooka_guards_africa_uk",
        count: 2,
        replacesNormalWeapon: true,
      },
    ],
  },
  add_lmg_stormtrooper_ger: {
    upgrades: ["mg42_stormtrooper_ger"],
  },

  // Example direct-weapon state tree:
  // some_state_tree_that_adds_weapon_directly: {
  //   weapons: [
  //     {
  //       pbg: "ebps/races/german/weapons/small_arms/single_fire/rifle/w_some_weapon",
  //       count: 1,
  //       replacesNormalWeapon: true,
  //     },
  //   ],
  // },
};

export const getStateTreeSpawnMapping = (stateTree?: string): StateTreeSpawnMapping => {
  if (!stateTree) return {};

  const mapped = StateTreeToSpawnMap[stateTree];

  return mapped ?? {};
};

// console.log(`Total BG workarounds: ${bgWorkarounds.size}`);
// console.log(`Total Ebps workarounds: ${ebpsWorkarounds.size}`);

export type AbilityStateTreeWeaponMapping = {
  abilityId: string;
  stateTreePath: readonly (string | number)[];
  stateTree: string;

  /**
   * Weapon EBPS IDs or direct weapon stat IDs.
   * Full instance_reference paths are okay too.
   */
  weaponIds?: string[];

  /**
   * Optional num-shots override/fill-in.
   * Can be used without weaponIds.
   */
  numShots?: number;

  /**
   * Default false: only fills numShots if source data did not provide it.
   */
  overrideNumShots?: boolean;
};

export const AbilityStateTreeWeaponMappings: AbilityStateTreeWeaponMapping[] = [
  // Weapon + shot count:
  // {
  //   abilityId: "some_ability_id",
  //   stateTreePath: ["ability_bag", "entity_tree"],
  //   stateTree: "ability_some_exact_entity_tree",
  //   weaponIds: ["some_weapon_or_weapon_ebps_id"],
  //   numShots: 1,
  // },
  {
    abilityId: "s_mine_launcher_tiger_ak",
    stateTreePath: ["ability_bag", "global_tree"],
    stateTree: "s_mine_launcher_tiger_ak",
    weaponIds: ["s_mine_launcher_ak"],
    numShots: 1,
  },
  {
    abilityId: "armor_shred_pak_38_ak",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "armor_shred_pak_38_ak",
    weaponIds: ["pak_38_armor_shred_ak"],
    numShots: 1,
  },
  {
    abilityId: "target_weak_point_flak_88_ak",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "target_weak_point_flak_88_ak",
    weaponIds: ["88mm_at_gun_target_weak_point_ak"],
    numShots: 1,
  },
  {
    abilityId: "barrage_howitzer_cannone_105_ak",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_cannone_da_105_ak",
    weaponIds: ["105mm_howitzer_cannone_barrage_ak"],
    numShots: 6,
  },
  {
    abilityId: "barrage_howitzer_75mm_leig_ak",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_75mm_leig_ak",
    weaponIds: ["75mm_barrage_leig_ak"],
    numShots: 6,
  },
  {
    abilityId: "goliath_detonate_ak",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "self_destruct_goliath_ger",
    weaponIds: ["goliath_destruct_ak"],
    numShots: 1,
  },
  {
    abilityId: "barrage_mortar_halftrack_250_ak",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_250_mortar_halftrack_ak",
    weaponIds: ["81mm_halftrack_mortar_barrage_ger"],
    numShots: 6,
  },
  {
    abilityId: "toggle_he_ap_rounds_panzer_iv_ger",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "toggle_he_ap_rounds_panzer_iv_ger",
    weaponIds: ["75mm_panzer_iv_stubby_ger"],
  },
  {
    abilityId: "barrage_semovente_ger",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "barrage_semovente_ger",
    weaponIds: ["75mm_semovente_artillery_barrage_ger"],
    numShots: 4,
  },
  {
    abilityId: "barrage_150mm_stuka_ak",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_halftrack_stuka_ak",
    weaponIds: ["280mm_stukazufuss_rocket_ak"],
    numShots: 6,
  },
  {
    abilityId: "creeping_barrage_stuka_ak",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "creeping_barrage_stuka_ak",
    weaponIds: ["280mm_stukazufuss_creeping_barrage_ak"],
    numShots: 6,
  },
  {
    abilityId: "barrage_howitzer_105mm_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_howitzer_105mm_us",
    weaponIds: ["105mm_howitzer_us", "105mm_howitzer_charged_us"],
    numShots: 6,
  },
  {
    abilityId: "veterancy_1a_light_it_up_engineer_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "veterancy_1a_light_it_up_engineer_us\\flamer_upgrade",
    weaponIds: ["flamethrower_aoe_engineer_us"],
  },
  {
    abilityId: "veterancy_1a_light_it_up_no_flamer_engineer_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "veterancy_1a_light_it_up_engineer_us\\no_upgrade",
    weaponIds: ["flamethrower_aoe_engineer_us"],
  },
  {
    abilityId: "weapon_crate_ranger_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_squad_tree",
    ],
    stateTree: "flight_system_wrapper_library\\squad_wrappers\\paradrop_run_entity_wrapper",
    weaponIds: [
      "bazooka_bazooka_team_us",
      "flamethrower_engineer_us",
      "bar_riflemen_us",
      "m1919a6_riflemen_us",
    ],
  },
  {
    abilityId: "toggle_lmg_bazooka_ssf_us",
    stateTreePath: ["ability_bag", "squad_tree"],
    stateTree: "toggle_lmg_bazooka_ssf_us",
    weaponIds: ["bazooka_devils_brigade_us", "m1941_lmg_devils_brigade_us"],
  },
  {
    abilityId: "barrage_81mm_mortar_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_81mm_mortar_us",
    weaponIds: ["81mm_mortar_barrage_us"],
    numShots: 6,
  },
  {
    abilityId: "veterancy_1a_timed_fuze_mortar_81mm_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "veterancy_1a_timed_fuze_mortar_81mm_us",
    weaponIds: ["81mm_mortar_timed_fuze_us"],
    numShots: 5,
  },
  {
    abilityId: "veterancy_1b_delayed_fuze_mortar_81mm_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "veterancy_1b_delayed_fuze_mortar_81mm_us",
    weaponIds: ["81mm_mortar_delayed_fuze_us"],
    numShots: 5,
  },
  {
    abilityId: "barrage_75mm_pack_howitzer_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_75mm_pack_howitzer_uk",
    weaponIds: ["75mm_pack_howitzer_barrage_us"],
    numShots: 8,
  },
  {
    abilityId: "veterancy_1a_fire_superiority_riflemen_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "veterancy_1a_fire_superiority_riflemen_us",
    weaponIds: [
      "garand_rifleman_fire_superiority_us",
      "thompson_riflemen_leader_fire_superiority_us",
      "bar_riflemen_fire_superiority_us",
    ],
  },
  {
    abilityId: "canister_shot_greyhound_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "canister_shot_greyhound_us\\canister_timed\\swap_to_canister",
    weaponIds: ["37mm_canister_shot_greyhound_us"],
  },
  {
    abilityId: "hvap_hellcat_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "hvap_hellcat_us",
    weaponIds: ["76mm_hellcat_hvap_us"],
  },
  {
    abilityId: "hvap_hellcat_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "hvap_hellcat_us",
    weaponIds: ["76mm_hellcat_hvap_us"],
  },
  {
    abilityId: "white_phosphorous_sherman_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "veterancy_1a_white_phosphorous_sherman_us",
    weaponIds: ["75mm_white_phosphorous_sherman_us"],
    numShots: 1,
  },
  {
    abilityId: "hvap_sherman_easy_8_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "hvap_sherman_easy_8_us",
    weaponIds: ["76mm_sherman_easy_8_hvap_us"],
  },
  {
    abilityId: "hvap_sherman_easy_8_vet_3_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "hvap_sherman_easy_8_us",
    weaponIds: ["76mm_sherman_easy_8_hvap_us"],
  },
  {
    abilityId: "veterancy_1a_he_rounds_sherman_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "sherman_he_rounds_us",
    weaponIds: ["75mm_sherman_he_rounds_us"],
  },
  {
    abilityId: "veterancy_1b_incendiary_barrage_sherman_bulldozer_us",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "sherman_bulldozer_incendiary_barrage_us",
    weaponIds: ["105mm_sherman_incendiary_barrage_us"],
    numShots: 4,
  },
  {
    abilityId: "barrage_180mm_rockets_whizbang_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_180mm_rockets_whizbang_us",
    weaponIds: ["180mm_rocket_barrage_whizbang_us"],
    numShots: 15,
  },
  {
    abilityId: "veterancy_1a_precision_sweep_sherman_us",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "veterancy_1a_precision_sweep_sherman_us",
    weaponIds: ["180mm_precision_sweep_whizbang_us"],
    numShots: 15,
  },
  {
    abilityId: "body_shot_australian_light_infantry_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "body_shot_australian_light_infantry_uk",
    weaponIds: ["lee_enfield_sharpshooter_uk"],
    numShots: 1,
  },
  {
    abilityId: "staggered_shot_guards_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "staggered_shot_guards_uk",
    weaponIds: [
      "bazooka_staggered_shot_guards_africa_uk",
      "bazooka_staggered_shot_stun_guards_africa_uk",
    ],
    numShots: 2,
  },
  {
    abilityId: "target_weak_point_2pdr_uk",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "target_weak_point_2pdr_uk",
    weaponIds: ["2pdr_at_gun_twp_uk"],
    numShots: 1,
  },
  {
    abilityId: "barrage_81mm_mortar_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_81mm_mortar_uk",
    weaponIds: ["81mm_mortar_barrage_uk"],
    numShots: 6,
  },
  {
    abilityId: "barrage_81mm_mortar_smoke_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_81mm_mortar_smoke_uk",
    weaponIds: ["81mm_mortar_smoke_uk"],
  },
  {
    abilityId: "barrage_4_2_heavy_mortar_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_4_2_heavy_mortar_uk",
    weaponIds: ["4_2_inch_heavy_mortar_barrage_uk"],
    numShots: 4,
  },
  {
    abilityId: "barrage_4_2_heavy_mortar_airburst_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_4_2_airburst_heavy_mortar_uk",
    weaponIds: ["4_2_inch_heavy_mortar_airburst_uk"],
    numShots: 4,
  },
  {
    abilityId: "barrage_4_2_heavy_mortar_incendiary_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_4_2_heavy_mortar_incendiary_uk",
    weaponIds: ["4_2_inch_heavy_mortar_incendiary_uk"],
  },
  {
    abilityId: "barrage_4_2_heavy_mortar_smoke_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_4_2_heavy_mortar_smoke_uk",
    weaponIds: ["4_2_inch_heavy_mortar_smoke_uk"],
  },
  {
    abilityId: "barrage_4_2_heavy_mortar_flare_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "flare_4_2_heavy_mortar_uk",
    weaponIds: ["4_2_inch_heavy_mortar_flare_uk"],
  },
  {
    abilityId: "barrage_75mm_pack_howitzer_smoke_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_75mm_pack_howitzer_smoke_uk",
    weaponIds: ["75mm_pack_howitzer_smoke_barrage_uk"],
  },
  {
    abilityId: "barrage_75mm_pack_howitzer_incendiary_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_75mm_pack_howitzer_incendiary_uk",
    weaponIds: ["75mm_pack_howitzer_incendiary_uk"],
  },
  {
    abilityId: "barrage_75mm_pack_howitzer_white_phosphorus_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_75mm_pack_howitzer_smoke_uk\\white_phosphorous\\library",
    weaponIds: ["75mm_pack_howitzer_white_phosphorus_uk"],
    numShots: 6,
  },
  {
    abilityId: "barrage_bishop_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_bishop_uk",
    weaponIds: ["25pdr_bishop_uk"],
    numShots: 6,
  },
  {
    abilityId: "first_strike_archer_uk",
    stateTreePath: ["ability_bag", "squad_tree"],
    stateTree: "squad_passive_stationary_bonus",
    weaponIds: ["archer_17pdr_first_strike_uk"],
    numShots: 1,
  },
  {
    abilityId: "smoke_shot_centaur_uk",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "smoke_shot_centaur_uk",
    weaponIds: ["95mm_smoke_round_centaur_uk"],
    numShots: 1,
  },
  {
    abilityId: "hesh_shell_centaur_uk",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "toggle_weapon",
    weaponIds: ["95mm_hesh_round_centaur_uk"],
  },
  {
    abilityId: "polish_cavalry_tulip_rocket_strike_sherman_firefly_africa_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "rotate_and_fire_coax_weapon_salvo",
    weaponIds: ["tulip_rocket_coaxial_firefly_uk", "tulip_rocket_coaxial_firefly_panzerbane_uk"],
    numShots: 1,
  },
  {
    abilityId: "tread_shot_stuart_uk",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "tread_shot_stuart_uk",
    weaponIds: ["37mm_treadshot_stuart_uk"],
    numShots: 1,
  },
  {
    abilityId: "shellburst_cwt_africa_uk",
    stateTreePath: ["ability_bag", "global_tree"],
    stateTree: "shellburst_cwt_truck_uk\\swap_to_shellburst_ammo",
    weaponIds: ["20mm_oerlikon_mount_cwt_shellburst_uk"],
  },
  {
    abilityId: "smoke_barrage_humber_uk",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "smoke_barrage_humber",
    weaponIds: ["2inch_mortar_smoke_humber_uk"],
  },
  {
    abilityId: "s_mine_launcher_grinding_advance_ger",
    stateTreePath: ["ability_bag", "global_tree"],
    stateTree: "s_mine_launcher_tiger_ak\\grinding_advance_launchers\\root",
    numShots: 1,
  },
  {
    abilityId: "s_mine_launcher_grinding_advance_32_ger",
    stateTreePath: ["ability_bag", "global_tree"],
    stateTree: "s_mine_launcher_tiger_ak\\grinding_advance_launchers\\root",
    numShots: 1,
  },
  {
    abilityId: "sniper_pinning_shot_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "sniper_pinning_shot_ger",
    weaponIds: ["g43_sniper_pinning_shot_ger"],
    numShots: 1,
  },
  {
    abilityId: "barrage_81mm_mortar_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_81mm_mortar_ger",
    weaponIds: ["81mm_mortar_barrage_ger"],
    numShots: 6,
  },
  {
    abilityId: "smoke_81mm_mortar_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "smoke_81mm_mortar_ger",
    weaponIds: ["81mm_mortar_smoke_ger"],
  },
  {
    abilityId: "flare_81mm_mortar_vet_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "ability_flare_81mm_mortar",
    weaponIds: ["flare_81mm_mortar_ger"],
  },
  {
    abilityId: "barrage_howitzer_obice_210_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_obice_210_howitzer_ger",
    weaponIds: ["obice_210_howitzer_ger"],
    numShots: 3,
  },
  {
    abilityId: "button_20mm_aa_flak_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "button_20mm_aa_flak_ger",
    weaponIds: ["20mm_aa_gun_button_ger"],
  },
  {
    abilityId: "suppressing_fire_aa_gun_20mm_ger",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "suppressing_fire_aa_gun_20mm_ger",
    weaponIds: ["20mm_aa_gun_suppressing_fire_ger"],
  },
  {
    abilityId: "white_phosphorus_rounds_hmg_vet_ger",
    stateTreePath: ["ability_bag", "squad_tree"],
    stateTree: "ability_vet_hmg_white_phosphorus_rounds",
    weaponIds: ["mg42_wp_hmg_ger"],
  },
  {
    abilityId: "barrage_halftrack_stummel_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_halftrack_stummel_ger",
    weaponIds: ["75mm_barrage_halftrack_stummel_ger"],
    numShots: 6,
  },
  {
    abilityId: "smoke_barrage_halftrack_stummel_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "smoke_barrage_halftrack_stummel_ger",
    weaponIds: ["75mm_smoke_barrage_halftrack_stummel_ger"],
  },
  {
    abilityId: "vet_white_phosphorous_stummel_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "vet_white_phosphorous_stummel_ger",
    weaponIds: ["white_phosphorous_stummel_ger"],
    numShots: 1,
  },
  {
    abilityId: "barrage_wespe_ger",
    stateTreePath: [
      "ability_bag",
      "ability_active_state_tree_group",
      "ability_activate_entity_tree",
    ],
    stateTree: "barrage_wespe_ger",
    weaponIds: ["105mm_wespe_ger"],
    numShots: 6,
  },
  {
    abilityId: "white_phosphorus_wirbelwind_vet_ger",
    stateTreePath: ["ability_bag", "entity_tree"],
    stateTree: "white_phosphorus_wirbelwind_ger",
    weaponIds: ["20mm_flakvierling_wirbelwind_wp_ger"],
  },
];

export const getAbilityStateTreeWeaponMappings = (abilityId: string) =>
  AbilityStateTreeWeaponMappings.filter((mapping) => mapping.abilityId === abilityId);

export { bgWorkarounds, ebpsWorkarounds };
