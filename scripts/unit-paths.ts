import { getMappings } from "../src/unitStats/mappings";
import nextI18NextConfig from "../next-i18next.config";

const pageHost = "https://coh3stats.com"

const generateAllUnitPages = async () => {
  const { sbpsData } = await getMappings();

  const unitPaths = []

  const factions = ["american", "british", "german", "dak", "afrika_korps"];
  const { locales } = nextI18NextConfig.i18n;

  for (const locale of locales) {
    for (const faction of factions) {
      const units = sbpsData.filter((squad: any) => squad.faction.includes(faction));
      for(const unit of units){
        const linkFaction = faction === "afrika_korps" ? "dak" : faction

        // For default locale (en), don't include locale in path
        if (locale === nextI18NextConfig.i18n.defaultLocale) {
          unitPaths.push(`${pageHost}/explorer/races/${linkFaction}/units/${unit.id}`)
        } else {
          unitPaths.push(`${pageHost}/${locale}/explorer/races/${linkFaction}/units/${unit.id}`)
        }
      }
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
