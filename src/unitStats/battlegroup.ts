import { raceType } from "../coh3/coh3-types";
import { AbilitiesType } from "./mappingAbilities";
import { BattlegroupsType } from "./mappingBattlegroups";
import { UpgradesType } from "./mappingUpgrades";

export enum BattlegroupArrows {
  AVAILABLE_1X1 = "icons/hud/battlegroups/1x1_available.webp",
  AVAILABLE_1X2 = "icons/hud/battlegroups/1x2_available.webp",
  AVAILABLE_2X1 = "icons/hud/battlegroups/2x1_available.webp",
  //  AVAILABLE_2X1_LEFT: 'icons/hud/battlegroups/2x1_available_l',
  //  AVAILABLE_2X1_RIGHT: 'icons/hud/battlegroups/2x1_available_r',
  AVAILABLE_2X2 = "icons/hud/battlegroups/2x2_available.webp",
  //  AVAILABLE_2X2_LEFT: 'icons/hud/battlegroups/2x2_available_l',
  //  AVAILABLE_2X2_RIGHT: 'icons/hud/battlegroups/2x2_available_r',
}

export enum BattlegroupBackgrounds {
  dak = "icons/hud/battlegroups/portrait_bg_ak.webp",
  german = "icons/hud/battlegroups/portrait_bg_ger.webp",
  british = "icons/hud/battlegroups/portrait_bg_uk.webp",
  american = "icons/hud/battlegroups/portrait_bg_us.webp",
}

type BattlegroupParentUiData = {
  /* Icon paths in-game. */
  iconName: string; // Could be empty.
  /* Locstring fields. We don't need the help nor the extra text as those are null. */
  screenName: string;
  briefText: string;
};

export type BattleGroupUpgradeType = {
  /** The upgrade resolved data. */
  upg: UpgradesType;
  /** The battlegroup ability contains the requirements (link between the
   * ability and the upgrade) and `costs_to_player` fields that we require for
   * displaying the ability info. */
  ability: AbilitiesType;
  /** A list of unit spawnable items. This is used for workarounds to re-direct
   * those abilities that call-in a squad. */
  spawnItems: string[];
};

export type BattlegroupResolvedBranchType = {
  name: string;
  upgrades: BattleGroupUpgradeType[];
};

/** Resolved battlegroup upgrades and branches. */
export type BattlegroupResolvedType = {
  /* Inherited fields from `BattlegroupsType`. */
  id: string;
  path: string;
  faction: string;
  name: string; // Name of the battlegroup
  /** Extracted from the resolved `activation_upgrade/instance_reference` (found
   * within the battlegroup.json) which points to the corresponding upgrade. */
  uiParent: BattlegroupParentUiData;
  /**
   * All the branches will be resolved with the upgrades, which are referenced
   * at `branch/upgrades`. This is a list so we must map this list to obtain the
   * `upgrade/instance_reference`. Use the upgrade id as key of this dictionary
   * and the resolved data as value.
   */
  branches: {
    LEFT: BattlegroupResolvedBranchType;
    RIGHT: BattlegroupResolvedBranchType;
  };
};

/** Update 1.2.0 added two incomplete battlegroups, so better hide those. */
const SkipBattlegroups = ["defense"];

/** Resolve the battlegroup branches with the corresponding upgrades. */
export function resolveBattlegroupBranches(
  race: raceType,
  battlegroups: BattlegroupsType[],
  upgrades: UpgradesType[],
  abilities: AbilitiesType[],
) {
  const faction = race === "dak" ? "afrika_korps" : race;
  const battlegroupsByFaction = battlegroups.filter(
    (x) => x.faction === faction && !SkipBattlegroups.includes(x.id),
  );
  return battlegroupsByFaction.map<BattlegroupResolvedType>((rawBattlegroup) => {
    const leftBranchUpgrades: BattleGroupUpgradeType[] = [];
    const rightBranchUpgrades: BattleGroupUpgradeType[] = [];

    rawBattlegroup.branchesRefs.LEFT.upgrades.forEach((upgradeRef) => {
      const upgradeId = upgradeRef.split("/").slice(-1)[0];
      const foundUpgrade = upgrades.find((upg) => upg.id === upgradeId);
      // If the upgrade is found, search for the corresponding ability.
      if (foundUpgrade?.id) {
        const foundAbility = abilities.find(
          (abil) => abil.requirements.playerUpgrade.split("/").slice(-1)[0] === foundUpgrade.id,
        );
        if (foundAbility) {
          leftBranchUpgrades.push({
            upg: foundUpgrade,
            ability: foundAbility,
            spawnItems: [],
          });
        }
      }
    });

    rawBattlegroup.branchesRefs.RIGHT.upgrades.forEach((upgradeRef) => {
      const upgradeId = upgradeRef.split("/").slice(-1)[0];
      const foundUpgrade = upgrades.find((upg) => upg.id === upgradeId);
      // If the upgrade is found, search for the corresponding ability.
      if (foundUpgrade?.id) {
        const foundAbility = abilities.find(
          (abil) => abil.requirements.playerUpgrade.split("/").slice(-1)[0] === foundUpgrade.id,
        );
        if (foundAbility) {
          rightBranchUpgrades.push({
            upg: foundUpgrade,
            ability: foundAbility,
            spawnItems: [],
          });
        }
      }
    });

    const uiParentUpgrade = upgrades.find(
      (upg) => upg.id === rawBattlegroup.activationRef.split("/").slice(-1)[0],
    );

    return {
      id: rawBattlegroup.id,
      path: rawBattlegroup.path,
      faction: rawBattlegroup.path,
      name: rawBattlegroup.name,
      uiParent: {
        iconName: uiParentUpgrade?.ui.iconName || "",
        screenName: uiParentUpgrade?.ui.screenName || "",
        briefText: uiParentUpgrade?.ui.briefText || "",
      },
      branches: {
        LEFT: {
          name: rawBattlegroup.branchesRefs.LEFT.name,
          upgrades: leftBranchUpgrades.sort(
            (a, b) =>
              a.upg.uiPosition.row - b.upg.uiPosition.row ||
              a.upg.uiPosition.column - b.upg.uiPosition.column,
          ),
        },
        RIGHT: {
          name: rawBattlegroup.branchesRefs.RIGHT.name,
          upgrades: rightBranchUpgrades.sort(
            (a, b) =>
              a.upg.uiPosition.row - b.upg.uiPosition.row ||
              a.upg.uiPosition.column - b.upg.uiPosition.column,
          ),
        },
      },
    };
  });
}
