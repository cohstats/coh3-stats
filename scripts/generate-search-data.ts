import { getMappings } from "../src/unitStats/mappings";
import { writeFileSync } from 'fs';
import { join } from 'path';

const generateSearchData = async () => {
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

generateSearchData().then((units) => {
  const searchDataPath = join(__dirname, '../screens/search/units-search-data.json');

  writeFileSync(
    searchDataPath,
    JSON.stringify(units, null, 2),
    'utf8'
  );

  console.log(`Search data saved to ${searchDataPath}`);
});

export default generateSearchData
