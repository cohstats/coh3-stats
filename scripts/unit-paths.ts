import { getMappings } from "../src/unitStats/mappings";

const pageHost = "https://coh3stats.com"

const generateAllUnitPages = async () => {
  const { sbpsData } = await getMappings();

  const unitPaths = []

  const factions = ["american", "british", "german", "dak", "afrika_korps"];

  for (const faction of factions) {
    const units = sbpsData.filter((squad: any) => squad.faction.includes(faction));
    for(const unit of units){
      const linkFaction = faction === "afrika_korps" ? "dak" : faction

      unitPaths.push(`${pageHost}/explorer/races/${linkFaction}/units/${unit.id}`)
    }

  }

  return unitPaths;
}

generateAllUnitPages().then((paths) => {
  for(const path of paths){
    console.log(path)
  }

})

export default generateAllUnitPages
