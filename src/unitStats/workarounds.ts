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
const SpawnItemMappings: { [abilityId: string]: string[] } = {
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

  // --- American ---
  airborne_right_1a_pathfinders_us: ["pathfinder_us"],
  airborne_right_1b_paradrop_hmg_us: ["hmg_30cal_paradrop_us"],
  airborne_right_2_paratrooper_us: ["paratrooper_us"],
  airborne_right_3_paradrop_at_gun_us: ["at_gun_57mm_paradrop_us"],
  armored_left_2b_recovery_vehicle_us: ["recovery_vehicle_us"],
  armored_right_2a_scott_us: ["scott_us"],
  armored_right_3_easy_8_task_force_us: ["sherman_easy_8_us"],
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
  if (abilityId === "australian_defense_australian_light_infantry_uk") {
    upg.ability.cost.manpower = 280;
    // Fall through to set spawnItems as well
  }

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

  ebpsWorkaround("Modify American - Mortar crew hitpoints", {
    predicate: (item) => item.faction === "american" && item.id === "crew_mortar_us",
    mutator: (item) => {
      item = item as EbpsType;
      item.health.hitpoints = 80;
    },
  });

  ebpsWorkaround("Modify British - Mortar crew hitpoints", {
    predicate: (item) => item.faction === "british" && item.id === "crew_mortar_uk",
    mutator: (item) => {
      item = item as EbpsType;
      item.health.hitpoints = 80;
    },
  });

  ebpsWorkaround("Modify British - Indian Mortar crew hitpoints", {
    predicate: (item) => item.faction === "british" && item.id === "crew_mortar_indian_uk",
    mutator: (item) => {
      item = item as EbpsType;
      item.health.hitpoints = 80;
    },
  });

  ebpsWorkaround("Modify British Africa - Mortar crew hitpoints", {
    predicate: (item) => item.faction === "british_africa" && item.id === "crew_mortar_africa_uk",
    mutator: (item) => {
      item = item as EbpsType;
      item.health.hitpoints = 80;
    },
  });

  ebpsWorkaround("Modify British Africa - Indian Mortar crew hitpoints", {
    predicate: (item) =>
      item.faction === "british_africa" && item.id === "crew_mortar_indian_africa_uk",
    mutator: (item) => {
      item = item as EbpsType;
      item.health.hitpoints = 80;
    },
  });
};

setBattlegroupsWorkarounds();
setEbpsWorkarounds();

// console.log(`Total BG workarounds: ${bgWorkarounds.size}`);
// console.log(`Total Ebps workarounds: ${ebpsWorkarounds.size}`);

export { bgWorkarounds, ebpsWorkarounds };
