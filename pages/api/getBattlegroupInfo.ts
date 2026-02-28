import { NextApiRequest, NextApiResponse } from "next";
import { logger } from "../../src/logger";
import { getBattlegroupStats, getUpgradesStats } from "../../src/unitStats";
import { resolveFactionLinkid } from "../../src/unitStats/dpsCommon";
import { fetchLocstring } from "../../src/unitStats/locstring";

/** Battlegroups to skip (incomplete ones). */
const SkipBattlegroups = ["defense"];

type BattlegroupInfoItem = {
  /** Essence ID (pbgid) of the battlegroup. */
  pbgid: number;
  /** Internal name/filename of the battlegroup (e.g., "panzergrenadier_ak"). */
  name: string;
  /** Nice/screen name from the activation upgrade UI. */
  screenName: string;
  /** Icon path for the battlegroup. */
  icon: string;
  /** Faction identifier (e.g., "german", "american", "british", "dak"). */
  faction: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`SSR - /api/getBattlegroupInfo`);

  try {
    const locale = (req.query.locale as string) || "en";

    // Locstring needs to be fetched first because it's used by the other mappings.
    await fetchLocstring(locale);

    const [battlegroupData, upgradesData] = await Promise.all([
      getBattlegroupStats(locale),
      getUpgradesStats(locale),
    ]);

    const battlegroupInfo: Record<number, BattlegroupInfoItem> = {};

    for (const bg of battlegroupData) {
      // Skip incomplete battlegroups
      if (SkipBattlegroups.includes(bg.id)) {
        continue;
      }

      // Find the activation upgrade to get the icon and screen name
      const activationUpgradeId = bg.activationRef.split("/").slice(-1)[0];
      const uiParentUpgrade = upgradesData.find((upg) => upg.id === activationUpgradeId);

      // Resolve faction to standard format (e.g., afrika_korps -> dak)
      const faction = resolveFactionLinkid(bg.faction);

      battlegroupInfo[bg.pbgid] = {
        pbgid: bg.pbgid,
        name: bg.id,
        screenName: uiParentUpgrade?.ui.screenName || bg.name,
        icon: uiParentUpgrade?.ui.iconName || "",
        faction: faction,
      };
    }

    res.setHeader("Cache-Control", "public, max-age=21600").status(200).json(battlegroupInfo);
  } catch (e) {
    logger.error(e);
    res.status(500).json({ error: "Failed to fetch battlegroup info" });
  }
}
