const listOfUnitsTobeIgnored = [
  // Has recrewable in the name.
  /_recrewable_/,
  /_recrew_/,
  // Units which end with _sp or _sp_gela
  /(_sp_gela|_sp)$/,
  /^officer_ger_sp_seaside_airfield$/,
  // Let's hide the base defense
  /^base_defense_/,
  //unused or SP units
  /^ambulance_us$/,
  /^anzioannie_ger$/,
  /^armored_car_222_ak$/,
  /^armored_car_8_rad_stummel_ak$/,
  /^at_gun_88mm_pak43_ger$/,
  /^bersaglieri_ger$/,
  /^bison_ak$/,
  /^bofors_towed_africa_uk$/,
  /^churchill_75mm_africa_uk$/,
  /^coastal_reserve_ak$/,
  /^command_churchill_africa_uk$/,
  /^cwt_15_flatbed_africa_uk$/,
  /^cwt_15_truck_repair_resupply_africa_uk$/,
  /^fallschirmsniper_ger$/,
  /^gebirgsjagers_ger$/,
  /^halftrack_250_deployment_\d_ak$/,
  /^halftrack_250_medical_ak$/,
  /^halftrack_251_flak_ger$/,
  /^halftrack_251_mortar_ger$/,
  /^halftrack_251_weapon_supply_ak$/,
  /^halftrack_medical_ak$/,
  /^hmg_commando_africa_uk$/,
  /^howitzer_105mm_ger$/,
  /^howitzer_25pdr_africa_uk$/,
  /^howitzer_base_25pdr_africa_uk$/,
  /^howitzer_cannone_da_105_ger$/,
  /^howitzer_obice_da_210_no_sandbags_ger$/,
  /^l6_40_flame_ger$/,
  /^l6_40_ger$/,
  /^leig_75mm_ger$/,
  /^logistics_truck_us$/,
  /^m13_40_command_ak$/,
  /^m13_40_ger$/,
  /^marksman_team_partisan$/,
  /^medic_africa_uk$/,
  /^medic_ger$/,
  /^medic_partisan$/,
  /^medic_us$/,
  /^mortar_bunker_ger$/,
  /^mortar_team_ak$/,
  /^nashorn_ger$/,
  /^panzer_i_command_ak$/,
  /^panzer_ii_command_ak$/,
  /^panzer_iii_37mm_ak$/,
  /^panzer_iii_50mm_short_ak$/,
  /^panzer_iii_ak$/,
  /^panzer_iii_command_ak$/,
  /^panzer_iv_stubby_ak$/,
  /^panzerjager_i_ak$/,
  /^pioneer_ger_mc_spotter$/,
  /^recovery_vehicle_ger$/,
  /^resistance_fighters_partisan$/,
  /^saboteurs_partisan$/,
  /^sas_africa_uk$/,
  /^semovente_75_18_ger$/,
  /^sniper_africa_uk$/,
  /^stuart_us$/,
  /^truck_2_5_cargo_ger$/,
  /^truck_2_5_fuel_ger$/,
  /^truck_2_5_medical_ger$/,
  /^truck_2_5_towed_cannone_da_105_ak$/,
  /^truck_4x4_medical_us$/,
  /^truck_6x6_us$/,
];

const unitToBeIgnored = (unitID: string, debug = false) => {
  for (const regex of listOfUnitsTobeIgnored) {
    if (regex.test(unitID)) {
      if (debug) console.log("Unit ignored:", unitID);
      return true;
    }
  }
  if (debug) console.log("Unit not ignored:", unitID);
  return false;
};

export { unitToBeIgnored };
