import { getMappings } from "../src/unitStats/mappings";
import { getMpMaps } from "../src/explorer/maps/mp-maps";
import { getMpMapMode } from "../src/explorer/maps/mp-maps-helpers";
import { writeFileSync } from 'fs';
import { join } from 'path';

const generateUnitsSearchData = async () => {
  const { sbpsData } = await getMappings();

  const allUnits = []

  // We want to generate just british africa units
  const factions = ["american", "british_africa", "german", "dak", "afrika_korps"];

  for (const faction of factions) {
    const units = sbpsData.filter((squad: any) => squad.faction.includes(faction));
    for(const unit of units){
      allUnits.push({
        id: unit.id,
        icon: unit.ui.iconName,
        name: unit.ui.screenName,
        faction: faction === "afrika_korps" ? "dak" : faction === "british_africa" ? "british" : faction,
        symbol: unit.ui.symbolIconName
      })
    }

  }

  return allUnits;
}

const generateMapsSearchData = async () => {
  const mpMapsData = await getMpMaps({ includePoints: false });

  if (!mpMapsData) return [];

  // Only the fields the search page actually renders/filters on - the full map has a lot more
  // (mapSize, resources, author, ...) that would just bloat the file we ship to the client.
  return Object.values(mpMapsData.maps).map((map) => ({
    id: map.id,
    name: map.name,
    mode: getMpMapMode(map),
    maxPlayers: map.maxPlayers,
    isCommunity: map.isCommunity,
  }));
}

const generateSearchData = async () => {
  const [units, maps] = await Promise.all([
    generateUnitsSearchData(),
    generateMapsSearchData(),
  ]);

  const unitsSearchDataPath = join(__dirname, '../screens/search/units-search-data.json');
  writeFileSync(unitsSearchDataPath, JSON.stringify(units, null, 2), 'utf8');
  console.log(`Search data saved to ${unitsSearchDataPath}`);

  const mapsSearchDataPath = join(__dirname, '../screens/search/maps-search-data.json');
  writeFileSync(mapsSearchDataPath, JSON.stringify(maps, null, 2), 'utf8');
  console.log(`Search data saved to ${mapsSearchDataPath}`);
}

generateSearchData();

export default generateSearchData
