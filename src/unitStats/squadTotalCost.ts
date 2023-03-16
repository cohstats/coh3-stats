import { EbpsType } from "./mappingEbps";
import { SbpsType } from "./mappingSbps";

/** Obtain the total cost of a squad by looking at `loadout`. */
export function getSquadTotalCost(sbpsUnit: SbpsType, ebpsData: EbpsType[]) {
  // Use the `loadout` data to link to the proper entities as an squad can
  // have multiple ebps references (happens with `team_weapons`).
  const loadouts = sbpsUnit.loadout.map((loadout) => ({
    ...loadout,
    id: loadout.type.split("/").slice(-1)[0], // Provides id match 1:1 between ebps <-> sbps.
  }));
  // Simply multiply the total numbers of all loadouts with a single
  // instance cost. they should all have the same.
  const ebpsUnits = loadouts.map((loadout) => ({
    loadout,
    entity: ebpsData.find((x) => x.id === loadout.id),
  }));
  /* Debugging total cost. */
  // console.group("🚀 ~ file: squadTotalCost.ts:18 ~ ebpsUnits:");
  // console.log(ebpsUnits);
  // console.groupEnd();
  const totalCost = ebpsUnits.reduce<EbpsType["cost"]>(
    (totalCost, ebpsUnit) => {
      totalCost.manpower += (ebpsUnit.entity?.cost.manpower || 0) * ebpsUnit.loadout.num;
      totalCost.fuel += (ebpsUnit.entity?.cost.fuel || 0) * ebpsUnit.loadout.num;
      totalCost.munition += (ebpsUnit.entity?.cost.munition || 0) * ebpsUnit.loadout.num;
      totalCost.popcap += (ebpsUnit.entity?.cost.popcap || 0) * ebpsUnit.loadout.num;
      totalCost.time += (ebpsUnit.entity?.cost.time || 0) * ebpsUnit.loadout.num;
      return totalCost;
    },
    {
      fuel: 0,
      manpower: 0,
      munition: 0,
      popcap: 0,
      time: 0,
    },
  );
  // Round the costs, so we avoid floating numbers being displayed in the UI
  // like 399.999995.
  (Object.keys(totalCost) as Array<keyof EbpsType["cost"]>).forEach(
    (key) => (totalCost[key] = Math.round(totalCost[key])),
  );
  return totalCost;
}
