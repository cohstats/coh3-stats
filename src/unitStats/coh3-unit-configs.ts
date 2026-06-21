const listOfUnitsTobeIgnored = [
  // Has recrewable in the name.
  /_recrewable_/,
  /_recrew_/,
  // Units which end with _sp or _sp_gela
  /(_sp_gela|_sp)$/,
  /^officer_ger_sp_seaside_airfield$/,
  // Let's hide the base defense
  /^base_defense_/,
  // Weird units to be ignored based on the skirmish mode
  /^bison_ak$/,
  /^logistics_truck_us$/,
  /^stuart_us$/,
  /^truck_4x4_medical_us$/,
  /^truck_6x6_us$/,
  // Ignore this unit
  /^assault_grenadier_ger$/,
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
