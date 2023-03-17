import { UpgradesType } from "./mappingUpgrades";

type BattleGroupUpgradeType = {
  /**
   * The upgrade resolved data.
   * @TODO The upgrade also requires the command points. */
  upg: UpgradesType;
  /**
   * As the battlegroup contains a branching display, we gonna use the abilities
   * reference to get the position within the row / column. This is found at
   * `abilities/upgrade_id/upgrade_bag/ui_position`
   */
  ui_position: { row: number; column: number };
};

type BattlegroupParentUiData = {
  /* Icon paths in-game. */
  iconName: string; // Could be empty.
  /* Locstring fields. We don't need the help nor the extra text as those are null. */
  screenName: string;
  briefText: string;
};

/** Resolved battlegroup upgrades and branches. */
export type BattlegroupResolvedType = {
  /** Extracted from the resolved `activation_upgrade/instance_reference`. */
  ui: BattlegroupParentUiData;
  /**
   * All the branches will be resolved with the upgrades, which are referenced
   * at `branch/upgrades`. This is a list so we must map this list to obtain the
   * `upgrade/instance_reference`. Use the upgrade id as key of this dictionary
   * and the resolved data as value.
   */
  branches: Record<
    string,
    {
      /** Found at `name/locstring/value` as resolved locstring. */
      name: string;
      /** The side represents the `branch` position via UI. */
      side: "LEFT" | "RIGHT";
      upgrades: BattleGroupUpgradeType[];
    }
  >;
};
