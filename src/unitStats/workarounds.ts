import { BattlegroupResolvedType } from "./battlegroup";
import { SbpsType } from "./mappingSbps";

type ItemType = SbpsType | BattlegroupResolvedType;

interface Override {
  /** */
  predicate: (item: ItemType) => boolean;
  /** */
  mutator: (item: ItemType) => void;
  /** */
  validator?: (item: ItemType) => boolean;
}

function bgWorkaround(description: string, override: Override) {
  bgWorkarounds.set(description, override);
}

const bgWorkarounds = new Map<string, Override>();

// --------------------- BATTLEGROUPS --------------------- //

function setBattlegroupsWorkarounds() {
  /** Template */
  // bgWorkaround("Modify Faction - xxxxxx BG Call-Ins", {
  //   predicate: (item) =>
  //     item.faction === "races/faction" && item.id === "yyyyyy",
  //   mutator: (item) => {
  //     item = item as BattlegroupResolvedType;
  //     // A Branch.
  //     item.branches.LEFT.upgrades.forEach((upg) => {
  //       switch (upg.ability.id) {
  //         case "":
  //           upg.spawnItems = [""];
  //           break;
  //         case "":
  //           upg.spawnItems = [""];
  //           break;
  //       }
  //     });
  //     // B Branch.
  //     item.branches.RIGHT.upgrades.forEach((upg) => {
  //       switch (upg.ability.id) {
  //         case "":
  //           upg.spawnItems = [""];
  //           break;
  //         case "":
  //           upg.spawnItems = [""];
  //           break;
  //       }
  //     });
  //   },
  // });

  bgWorkaround("Modify Afrika Korps - Armored Support BG Call-Ins", {
    predicate: (item) => item.faction === "races/afrika_korps" && item.id === "armored_support",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Armored Warfare branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "armored_support_flame_p3_ak":
            upg.spawnItems = ["panzer_iii_flame_ak"];
            break;
          case "armored_support_command_p4_ak":
            upg.spawnItems = ["panzer_iv_command_ak"];
            break;
        }
      });
    },
  });
  bgWorkaround("Modify Afrika Korps - Italian Combined Arms BG Call-Ins", {
    predicate: (item) =>
      item.faction === "races/afrika_korps" && item.id === "italian_combined_arms",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Combined Arms Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "italian_combined_arms_bersaglieri_ak":
            upg.spawnItems = ["bersaglieri_ak"];
            break;
        }
      });
      // Italian Armor Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "italian_combined_arms_semovente_ak":
            upg.spawnItems = ["semovente_75_18_ak"];
            break;
          case "italian_combined_arms_m13_40_ak":
            upg.spawnItems = ["m13_40_ak"];
            break;
        }
      });
    },
  });
  bgWorkaround("Modify Afrika Korps - Italian Infantry BG Call-Ins", {
    predicate: (item) => item.faction === "races/afrika_korps" && item.id === "italian_infantry",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Field Engineering Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "italian_infantry_guastatori_ak":
            upg.spawnItems = ["guastatori_ak"];
            break;
          case "italian_infantry_cannone_da_105_ak":
            upg.spawnItems = ["howitzer_cannone_da_105_ak"];
            break;
        }
      });
      // Defensive Warfare Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "italian_infantry_double_l640_ak":
            upg.spawnItems = ["l6_40_ak", "l6_40_ak"];
            break;
        }
      });
    },
  });

  bgWorkaround("Modify British - Air and Sea BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "british_air_and_sea",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Royal Navy Support branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "british_air_and_sea_left_2a_centaur_cs_uk":
            upg.spawnItems = ["centaur_africa_uk"];
            break;
        }
      });
      // Royal Air Force branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "british_air_and_sea_right_1_commandos_uk":
            upg.spawnItems = ["commando_africa_uk"];
            break;
          case "british_air_and_sea_right_2a_pack_howitzer_team_uk":
            upg.spawnItems = ["pack_howitzer_75mm_africa_uk"];
            break;
          case "british_air_and_sea_right_2b_commando_lmg_team_uk":
            upg.spawnItems = ["commando_lmg_africa_uk"];
            break;
        }
      });
    },
  });
  bgWorkaround("Modify British - British Armored BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "british_armored",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Heavy Armor Support
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "british_armored_right_2_crusader_aa_uk":
            upg.spawnItems = ["crusader_aa_africa_uk"];
            break;
          case "british_armored_left_2_churchill":
            upg.spawnItems = ["churchill_africa_uk"];
            break;
          case "british_armored_left_3b_churchill_black_prince_uk":
            upg.spawnItems = ["churchill_black_prince_africa_uk"];
            break;
        }
      });
      // Field Support and Logistics Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          // Do nothing.
          default:
            break;
        }
      });
    },
  });
  bgWorkaround("Modify British - Indian Artillery BG Call-Ins", {
    predicate: (item) => item.faction === "races/british" && item.id === "indian_artillery",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Infantry Assault Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "artillery_gurkhas_uk":
            upg.spawnItems = ["gurkhas_africa_uk"];
            break;
        }
      });
      // Artillery Support Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "artillery_4_2_inch_heavy_mortar_uk":
            upg.spawnItems = ["mortar_heavy_4_2_africa_uk"];
            break;
          case "artillery_bl_5_5_heavy_artillery_uk":
            upg.spawnItems = ["howitzer_bl_5_5_africa_uk"];
            break;
        }
      });
    },
  });

  bgWorkaround("Modify American - Airborne BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "airborne",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Aerial Support Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          // Do nothing.
          default:
            break;
        }
      });
      // Paradropped Infantry Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "airborne_right_1b_paradrop_hmg_us":
            upg.spawnItems = ["hmg_30cal_paradrop_us"];
            break;
          case "airborne_right_2_paratrooper_us":
            upg.spawnItems = ["paratrooper_us"];
            break;
          case "airborne_right_3_paradrop_at_gun_us":
            upg.spawnItems = ["at_gun_57mm_paradrop_us"];
            break;
        }
      });
    },
  });
  bgWorkaround("Modify American - Armored BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "armored",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Engineering Corp Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "armored_left_2b_recovery_vehicle_us":
            upg.spawnItems = ["recovery_vehicle_us"];
            break;
        }
      });
      // Armored Doctrine Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "armored_right_2a_scott_us":
            upg.spawnItems = ["scott_us"];
            break;
          case "armored_right_3_sherman_easy_8_us":
            upg.spawnItems = ["sherman_easy_8_us"];
            break;
        }
      });
    },
  });
  bgWorkaround("Modify American - Special Operations BG Call-Ins", {
    predicate: (item) => item.faction === "races/american" && item.id === "special_operations",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Combat Support Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "special_operations_left_1a_m29_weasal_us":
            upg.spawnItems = ["m29_weasal_us"];
            break;
          case "special_operations_left_1b_m29_weasal_with_pack_howitzer":
            upg.spawnItems = ["m29_weasal_us", "engineer_us"];
            break;
          case "special_operations_left_3_whizbang_us":
            upg.spawnItems = ["sherman_whizbang_us"];
            break;
        }
      });
      // Combat Operations Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "special_operations_right_3a_assault_operation_us":
            upg.spawnItems = ["ssf_commandos_us"];
            break;
        }
      });
    },
  });

  bgWorkaround("Modify German - Breakthrough BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "breakthrough",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Assault Forces Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "breakthrough_right_3a_assault_group_ger":
            upg.spawnItems = ["stormtrooper_ger", "halftrack_ger"];
            break;
        }
      });
      // Armored Offensive Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "breakthrough_left_1b_truck_2_5_ger":
            upg.spawnItems = ["truck_2_5_cargo_ger"];
            break;
          case "breakthrough_left_2b_panzer_iv_cmd_ger":
            upg.spawnItems = ["panzer_iv_cmd_ger"];
            break;
          case "breakthrough_left_3_tiger_ger":
            upg.spawnItems = ["tiger_ger"];
            break;
        }
      });
    },
  });
  bgWorkaround("Modify German - Luftwaffe BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "luftwaffe",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Luftwaffe Air-to-Ground Support Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "luftwaffe_right_2_fallschirmjagers_ger":
            upg.spawnItems = ["fallschirmjagers_ger"];
            break;
        }
      });
      // Luftwaffe Field Support Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "luftwaffe_left_1b_fallschirmpioneers_ger":
            upg.spawnItems = ["fallschirmpioneers_ger"];
            break;
          case "luftwaffe_left_2b_combat_group_ger":
            upg.spawnItems = ["wirbelwind_ger", "jaeger_ger"];
            break;
          case "luftwaffe_left_2a_weapon_drop_ger":
            upg.spawnItems = ["at_gun_lg40_ger"];
            break;
          case "luftwaffe_left_3_88mm_at_gun_ger":
            /** The ability enables building the emplacement. */
            upg.spawnItems = ["aa_gun_20mm_emplacement_ger"];
            break;
        }
      });
    },
  });
  bgWorkaround("Modify German - Mechanized BG Call-Ins", {
    predicate: (item) => item.faction === "races/german" && item.id === "mechanized",
    mutator: (item) => {
      item = item as BattlegroupResolvedType;
      // Mechanized Armor Branch.
      item.branches.LEFT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "mechanized_right_2a_stug_assault_group_ger":
            upg.spawnItems = ["stug_iii_d_ger"];
            break;
          case "mechanized_left_2b_8_rad_ger":
            upg.spawnItems = ["armored_car_8_rad_ger"];
            break;
          case "mechanized_right_3_panther_ger":
            upg.spawnItems = ["panther_ger"];
            break;
        }
      });
      // Mechanized Support Branch.
      item.branches.RIGHT.upgrades.forEach((upg) => {
        switch (upg.ability.id) {
          case "mechanized_left_3a_wespe_ger":
            upg.spawnItems = ["wespe_ger"];
            break;
        }
      });
    },
  });
}

setBattlegroupsWorkarounds();

console.log(`Total BG workarounds: ${bgWorkarounds.size}`);

export { bgWorkarounds };
