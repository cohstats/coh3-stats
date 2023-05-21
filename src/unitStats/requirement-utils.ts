type RequirementTypeRequirement = {
  required: RequiredType;
};

type RequiredType = {
  template_reference: RequiredTemplateReference;
  reason: string;
  ui_name: { locstring: { name: "ui_name"; value: string } };
  resource?: Resource;
  in_supply?: string;
  is_secured?: IncludeQueued;
  is_secured_by_checkpoint?: IncludeQueued;
  not_in_transition?: IncludeQueued;
  is_present?: string;
  max_completed?: number;
  min_completed?: number;
  upgrade_name?: UpgradeName;
  include_completed?: string;
  include_queued?: IncludeQueued;
  include_pbg_parenting?: IncludePbgParenting;
  requirements?: RequiredRequirement[];
};

type IncludePbgParenting = {
  include_child_pbgs: IncludeQueued;
  include_parent_pbgs: IncludeQueued;
};

type IncludeQueued = "False";

type PurpleRequirement = {
  template_reference: RequiredTemplateReference;
  reason: string;
  ui_name: { locstring: { name: "ui_name"; value: string } };
  is_present?: string;
  max_completed?: number;
  min_completed?: number;
  upgrade_name?: UpgradeName;
  include_completed?: string;
  include_queued?: IncludeQueued;
  include_pbg_parenting?: IncludePbgParenting;
  requirements?: RequiredRequirement[];
};

type RequiredRequirement = {
  requirement: PurpleRequirement;
};

type RequiredTemplateReference = {
  name: "requirement" | "required";
  value:
    | "requirements\\required_player_resources"
    | "requirements\\required_in_territory"
    | "requirements\\required_player_upgrade"
    | "requirements\\required_any_in_list"
    | "requirements\\required_all_in_list";
};

type UpgradeName = {
  instance_reference: string;
};

type Resource = {
  action: number;
  command: number;
  popcap: number;
  fuel: number;
  munition: number;
  manpower: number;
  requisition: number;
  ultimate: number;
};

/** Extract requirement full path of the instance reference. */
export function extractRequirements(reqItem: RequirementTypeRequirement) {
  const mappedRequirements: string[] = [];

  const reqType = reqItem?.required.template_reference.value.split("\\")[1];
  switch (reqType) {
    // 1-Level Nesting
    case "required_player_upgrade":
      const upgradeRef = reqItem.required.upgrade_name?.instance_reference;
      // Only include those that have the flag `is_present` set to true.
      if (upgradeRef && reqItem.required.is_present) {
        mappedRequirements.push(upgradeRef);
      }
      break;
    // 2-Level Nesting
    case "required_any_in_list":
    case "required_all_in_list":
      if (!reqItem?.required?.requirements?.length) break;
      for (const playerUpgradeReq of reqItem.required.requirements) {
        const nestedValue = playerUpgradeReq?.requirement.template_reference.value.split("\\")[1];
        switch (nestedValue) {
          case "required_player_upgrade":
            const upgradeRef = playerUpgradeReq.requirement.upgrade_name?.instance_reference;
            // Only include those that have the flag `is_present` set to true.
            if (upgradeRef && playerUpgradeReq.requirement.is_present) {
              mappedRequirements.push(upgradeRef);
            }
            break;
          case "required_all_in_list":
            if (!playerUpgradeReq?.requirement?.requirements?.length) break;
            for (const subReq of playerUpgradeReq.requirement.requirements) {
              const upgradeRef = subReq.requirement.upgrade_name?.instance_reference;
              // Only include those that have the flag `is_present` set to true.
              if (upgradeRef && subReq.requirement.is_present) {
                mappedRequirements.push(upgradeRef);
              }
            }
            break;
          default:
            break;
        }
      }
      break;

    default:
      break;
  }

  return mappedRequirements;
}
