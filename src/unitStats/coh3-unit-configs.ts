const listOfUnitsTobeIgnored = [
  // Has recrewable in the name.
  /_recrewable_/,
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
