import { EbpsType } from "./mappingEbps";
import { SbpsType } from "./mappingSbps";

/**
 * These fields can be found at `ebps` / `upgrade` inside each entity object.
 *
 * - For the units, look at `ebps` -> `exts` -> `template_reference` which gives
 *   the group within the Essence editor as `ebpextensions\\cost_ext`.
 * - For the upgrades, look at `upgrade` -> `upgrade_bag`.
 *
 * For both entities, the field is called `time_cost`.
 */
export type ResourceValues = {
  /** Value at `cost/fuel`. */
  fuel?: number;
  /** Value at `cost/munition`. */
  munition?: number;
  /** Value at `cost/munition`. */
  manpower?: number;
  /** Value at `cost/popcap`. */
  popcap?: number;
  /** Value at `time_seconds`. */
  time_seconds?: number;
  /** Value at `command`. */
  command?: number;
};

export function hasCost(costObjc: ResourceValues | undefined) {
  return Object.values(costObjc || {}).some((x) => x && x > 0);
}

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
  /**
   * Important note found in the editor from designer:
   * - The population cost of this SQUAD is stored as
   *   `squad_population_ext/personnel_pop` which stacks with
   *   `population_ext/personnel_pop` in the EBPS.
   */
  const totalCost = ebpsUnits.reduce<Required<ResourceValues>>(
    (tc, ebpsUnit) => {
      tc.manpower += (ebpsUnit.entity?.cost.manpower || 0) * ebpsUnit.loadout.num;
      tc.fuel += (ebpsUnit.entity?.cost.fuel || 0) * ebpsUnit.loadout.num;
      tc.munition += (ebpsUnit.entity?.cost.munition || 0) * ebpsUnit.loadout.num;
      tc.popcap += (ebpsUnit.entity?.populationExt.personnel_pop || 0) * ebpsUnit.loadout.num;
      tc.time_seconds += (ebpsUnit.entity?.cost.time || 0) * ebpsUnit.loadout.num;
      return tc;
    },
    {
      fuel: 0,
      manpower: 0,
      munition: 0,
      popcap: sbpsUnit.populationExt.personnel_pop,
      time_seconds: 0,
      command: 0,
    },
  );
  // console.log("🚀 ~ file: squadTotalCost.ts:71 ~ getSquadTotalCost ~ totalCost:", totalCost);
  // Round the costs, so we avoid floating numbers being displayed in the UI
  // like 399.999995.
  (Object.keys(totalCost) as Array<keyof ResourceValues>).forEach(
    (key) => (totalCost[key] = Math.round(totalCost[key])),
  );
  return totalCost;
}

export function getSquadTotalUpkeepCost(sbpsUnit: SbpsType, ebpsData: EbpsType[]) {
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
  const totalUpkeepCost = ebpsUnits.reduce(
    (tc, ebpsUnit) => {
      const popcap = ebpsUnit.entity?.populationExt.personnel_pop || 0;
      const upkeepCost = ebpsUnit.entity?.populationExt.upkeep_per_pop;
      tc.manpower += (upkeepCost?.manpower || 0) * popcap * ebpsUnit.loadout.num;
      tc.fuel += (upkeepCost?.fuel || 0) * popcap * ebpsUnit.loadout.num;
      tc.munition += (upkeepCost?.munition || 0) * popcap * ebpsUnit.loadout.num;
      return tc;
    },
    {
      fuel: sbpsUnit.populationExt.upkeep_per_pop.fuel * sbpsUnit.populationExt.personnel_pop,
      manpower:
        sbpsUnit.populationExt.upkeep_per_pop.manpower * sbpsUnit.populationExt.personnel_pop,
      munition:
        sbpsUnit.populationExt.upkeep_per_pop.munition * sbpsUnit.populationExt.personnel_pop,
    },
  );
  // Round the costs, so we avoid floating numbers being displayed in the UI
  // like 399.999995.
  (Object.keys(totalUpkeepCost) as Array<"fuel" | "manpower" | "munition">).forEach(
    (key) => (totalUpkeepCost[key] = Math.round(totalUpkeepCost[key])),
  );
  return totalUpkeepCost;
}
