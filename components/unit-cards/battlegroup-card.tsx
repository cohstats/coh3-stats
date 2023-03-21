import { Stack, Card, Divider, Grid, Title, Accordion } from "@mantine/core";
import { raceType } from "../../src/coh3/coh3-types";
import {
  BattlegroupsType,
  AbilitiesType,
  UpgradesType,
  resolveBattlegroupBranches,
  BattlegroupResolvedBranchType,
} from "../../src/unitStats";
import { UnitUpgradeCard } from "./unit-upgrade-card";

function groupBy<T>(arr: T[], fn: (item: T) => any) {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    const groupKey = fn(curr);
    const group = prev[groupKey] || [];
    group.push(curr);
    return { ...prev, [groupKey]: group };
  }, {});
}

const BattlegroupBranchMapping = (branch: BattlegroupResolvedBranchType) => {
  const groupedRows = groupBy(branch.upgrades, (item) => item.upg.uiPosition.row);
  // Create a series of grid elements per row.
  return (
    <Stack align="center">
      <Title order={4} color="orange.5" transform="uppercase">
        {branch.name}
      </Title>

      {Object.entries(groupedRows).map(([rowIndex, branchUpgrades]) => {
        return (
          <Grid
            key={`${rowIndex}_${branch.name}`}
            columns={branchUpgrades.length}
            sx={{ width: branchUpgrades.length === 1 ? "" : "100%" }}
          >
            {branchUpgrades.map(({ upg, ability }) => (
              <Grid.Col key={upg.id} span={1}>
                <Card p="lg" radius="md" withBorder>
                  <UnitUpgradeCard
                    id={upg.id}
                    desc={{
                      screen_name: upg.ui.screenName,
                      help_text: upg.ui.helpText,
                      extra_text: upg.ui.extraText,
                      brief_text: upg.ui.briefText,
                      icon_name: upg.ui.iconName,
                    }}
                    time_cost={{
                      manpower: ability.cost.manpower,
                      munition: ability.cost.munition,
                      fuel: ability.cost.fuel,
                      popcap: ability.cost.popcap,
                      time_seconds: ability.rechargeTime,
                      command: upg.cost.command,
                    }}
                  ></UnitUpgradeCard>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        );
      })}
    </Stack>
  );
};

/** Battlegroup icons are not 1:1 and the current ones make use of re-used assets. */
const BattlegroupIcons = {
  dak: {
    armored_support: "races/afrika_corps/battlegroups/armored_ak_ger_portrait",
    italian_combined_arms: "races/afrika_corps/battlegroups/combined_arms_ak_portrait",
    italian_infantry: "races/afrika_corps/battlegroups/italian_infantry_ak_portrait",
  } as Record<BattlegroupAfricaKorpsIds, string>,
  german: {
    breakthrough: "races/german/battlegroups/breakthrough_ger_portrait",
    luftwaffe: "races/german/battlegroups/luftwaffe_ger_portrait",
    mechanized: "races/german/battlegroups/mechanized_ger_ger_portrait",
  } as Record<BattlegroupGermanIds, string>,
  american: {
    airborne: "races/american/battlegroups/paratroopers_us_portrait",
    armored: "races/american/battlegroups/armored_us_portrait",
    special_operations: "races/american/battlegroups/spec_ops_us_portrait",
  } as Record<BattlegroupAmericanIds, string>,
  british: {
    british_air_and_sea: "races/british/battlegroups/air_and_sea_uk_portrait",
    british_armored: "races/british/battlegroups/armored_uk_portrait",
    indian_artillery: "races/british/battlegroups/indian_artillery_uk_portrait",
  } as Record<BattlegroupBritishIds, string>,
} as const;

type BattlegroupAfricaKorpsIds = "armored_support" | "italian_combined_arms" | "italian_infantry";
type BattlegroupGermanIds = "breakthrough" | "luftwaffe" | "mechanized";
type BattlegroupBritishIds = "british_air_and_sea" | "british_armored" | "indian_artillery";
type BattlegroupAmericanIds = "airborne" | "armored" | "special_operations";

function getBattlegroupIcon(id: string, race: raceType) {
  switch (race) {
    case "dak":
      return BattlegroupIcons.dak[id as BattlegroupAfricaKorpsIds];
    case "german":
      return BattlegroupIcons.german[id as BattlegroupGermanIds];
    case "american":
      return BattlegroupIcons.american[id as BattlegroupAmericanIds];
    case "british":
      return BattlegroupIcons.british[id as BattlegroupBritishIds];
  }
}

export const BattlegroupCard = (
  race: raceType,
  data: {
    battlegroupData: BattlegroupsType[];
    abilitiesData: AbilitiesType[];
    upgradesData: UpgradesType[];
  },
) => {
  const resolvedBattlegroups = resolveBattlegroupBranches(
    race,
    data.battlegroupData,
    data.upgradesData,
    data.abilitiesData,
  );
  return (
    <Stack>
      {resolvedBattlegroups.map(({ id, uiParent, branches }) => {
        return (
          <Card key={id} p="sm" radius="md" withBorder>
            {/* Header Section */}
            <UnitUpgradeCard
              id={id}
              desc={{
                screen_name: uiParent.screenName,
                help_text: "",
                extra_text: "",
                brief_text: uiParent.briefText,
                icon_name: getBattlegroupIcon(id, race),
              }}
              time_cost={{
                fuel: undefined,
                munition: undefined,
                manpower: undefined,
                popcap: undefined,
                time_seconds: undefined,
              }}
            ></UnitUpgradeCard>

            {/* Branches Section */}
            <Divider my={12} size="md"></Divider>

            <Accordion chevronPosition="right">
              <Accordion.Item value="left_branch">
                <Accordion.Control>
                  <Title order={4}>{branches.LEFT.name}</Title>
                </Accordion.Control>
                <Accordion.Panel>{BattlegroupBranchMapping(branches.LEFT)}</Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="right_branch">
                <Accordion.Control>
                  <Title order={4}>{branches.RIGHT.name}</Title>
                </Accordion.Control>
                <Accordion.Panel>{BattlegroupBranchMapping(branches.RIGHT)}</Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Card>
        );
      })}
    </Stack>
  );
};
