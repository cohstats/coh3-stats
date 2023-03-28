import { Stack, Card, Divider, Grid, Title, Accordion, Box } from "@mantine/core";
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

  const bgCallInCard = ({ upg, ability }: { upg: UpgradesType; ability: AbilitiesType }) => (
    <Box
      p="sm"
      sx={(theme) => ({
        borderRadius: theme.radius.md,
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2],
      })}
    >
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
        cfg={{ compact: true }}
      ></UnitUpgradeCard>
    </Box>
  );

  return (
    <Stack align="center">
      <Title order={4} color="orange.5" transform="uppercase">
        {branch.name}
      </Title>

      {Object.entries(groupedRows).map(([rowIndex, branchUpgrades]) => {
        return (
          <Grid key={`${rowIndex}_${branch.name}`} columns={branchUpgrades.length} w="100%">
            {branchUpgrades.map(({ upg, ability }) => (
              <Grid.Col key={upg.id} span={1}>
                {bgCallInCard({ upg, ability })}
              </Grid.Col>
            ))}
          </Grid>
        );
      })}
    </Stack>
  );
};

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
                icon_name: uiParent.iconName,
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

            <Grid columns={2} gutter={0}>
              <Grid.Col md={1}>
                <Accordion p={0} chevronPosition="right">
                  <Accordion.Item value="left_branch">
                    <Accordion.Control>
                      <Title order={4}>{branches.LEFT.name}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>{BattlegroupBranchMapping(branches.LEFT)}</Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Grid.Col>

              <Grid.Col md={1}>
                <Accordion p={0} chevronPosition="right">
                  <Accordion.Item value="right_branch">
                    <Accordion.Control>
                      <Title order={4}>{branches.RIGHT.name}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>{BattlegroupBranchMapping(branches.RIGHT)}</Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Grid.Col>
            </Grid>
          </Card>
        );
      })}
    </Stack>
  );
};
