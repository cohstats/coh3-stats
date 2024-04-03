import {
  Stack,
  Card,
  Divider,
  Grid,
  Title,
  Accordion,
  Box,
  Anchor,
  ActionIcon,
  Flex,
  createStyles,
  Tooltip,
  Select,
  HoverCard,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { raceType } from "../../src/coh3/coh3-types";
import {
  BattlegroupsType,
  AbilitiesType,
  UpgradesType,
  resolveBattlegroupBranches,
  BattlegroupResolvedBranchType,
  SbpsType,
} from "../../src/unitStats";
import { bgWorkarounds } from "../../src/unitStats/workarounds";
import { UnitUpgradeCard } from "./unit-upgrade-card";
import { useToggle } from "@mantine/hooks";
import { IconAdjustments } from "@tabler/icons-react";
import { getExplorerUnitRoute } from "../../src/routes";

const useStyles = createStyles((theme) => ({
  hiddenMobile: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },
}));

function groupBy<T>(arr: T[], fn: (item: T) => any) {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    const groupKey = fn(curr);
    const group = prev[groupKey] || [];
    group.push(curr);
    return { ...prev, [groupKey]: group };
  }, {});
}

const BattlegroupBranchMapping = (
  branch: BattlegroupResolvedBranchType,
  faction: raceType,
  sbpsData: SbpsType[],
) => {
  const router = useRouter();

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
          help_text: "Ability / Call In",
          extra_text: upg.ui.helpText,
          brief_text: upg.ui.briefText,
          icon_name: upg.ui.iconName,
          extra_text_formatter: upg.ui.extraTextFormatter,
          brief_text_formatter: upg.ui.briefTextFormatter,
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

  const anchorLinkOrSelect = ({
    spawnItems,
    upg,
    ability,
  }: {
    spawnItems: string[];
    upg: UpgradesType;
    ability: AbilitiesType;
  }) => {
    if (spawnItems.length > 1) {
      const mappedSpawnItems = spawnItems.map((id) => {
        const foundSbps = sbpsData.find((x) => x.id === id);
        return { value: id, label: foundSbps?.ui.screenName || id };
      });
      return (
        <HoverCard width={280} shadow="md" position="top">
          <HoverCard.Target>{bgCallInCard({ upg, ability })}</HoverCard.Target>
          <HoverCard.Dropdown>
            <Select
              label="Select squad / emplacement"
              placeholder="Pick one"
              data={mappedSpawnItems}
              onChange={(val) => (val ? router.push(getExplorerUnitRoute(faction, val)) : "")}
            />
          </HoverCard.Dropdown>
        </HoverCard>
      );
    }

    return (
      <Anchor
        color="undefined"
        underline={false}
        sx={{
          "&:hover": {
            textDecoration: "none",
          },
        }}
        component={Link}
        href={getExplorerUnitRoute(faction, spawnItems[0])}
      >
        {bgCallInCard({ upg, ability })}
      </Anchor>
    );
  };

  return (
    <Stack align="center">
      <Title order={4} color="orange.5" transform="uppercase">
        {branch.name}
      </Title>

      {Object.entries(groupedRows).map(([rowIndex, branchUpgrades]) => {
        return (
          <Grid key={`${rowIndex}_${branch.name}`} columns={branchUpgrades.length} w="100%">
            {branchUpgrades.map(({ upg, ability, spawnItems }) => (
              <Grid.Col key={upg.id} span={1}>
                {spawnItems.length
                  ? anchorLinkOrSelect({ spawnItems, upg, ability })
                  : bgCallInCard({ upg, ability })}
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
    sbpsData: SbpsType[];
  },
) => {
  const { classes } = useStyles();
  const resolvedBattlegroups = resolveBattlegroupBranches(
    race,
    data.battlegroupData,
    data.upgradesData,
    data.abilitiesData,
  );

  for (const resBg of resolvedBattlegroups) {
    for (const [override, { predicate, mutator, validator }] of bgWorkarounds) {
      if (predicate(resBg)) {
        mutator(resBg);
        // console.info(`Overriding ${item.id} with ${override}`);
        if (validator && !validator(resBg)) {
          console.error(`Invalid item ${resBg.id} after override ${override}`, resBg);
          // throw new Error("Error during bg workarounds");
        }
      }
    }
  }

  // console.group("Resolved BG");
  // console.log(resolvedBattlegroups);
  // console.groupEnd();

  // Options to toggle between comparison or full width mode for desktop.
  const [value, toggle] = useToggle([1, 2]);

  return (
    <Stack>
      {resolvedBattlegroups.map(({ id, uiParent, branches }) => {
        return (
          <Card key={id} p="sm" radius="md" withBorder>
            {/* Header Section */}
            <Flex justify="space-between" align="center">
              {UnitUpgradeCard({
                id,
                desc: {
                  screen_name: uiParent.screenName,
                  help_text: "",
                  extra_text: "",
                  extra_text_formatter: "",
                  brief_text: uiParent.briefText,
                  icon_name: uiParent.iconName,
                  brief_text_formatter: "",
                },
                time_cost: {},
              })}
              <Tooltip
                className={classes.hiddenMobile}
                label="Toggle between comparison or default mode."
              >
                <ActionIcon color={["yellow.6", "blue.6"][value - 1]} onClick={() => toggle()}>
                  <IconAdjustments></IconAdjustments>
                </ActionIcon>
              </Tooltip>
            </Flex>

            {/* Branches Section */}
            <Divider my={12} size="md"></Divider>

            <Grid columns={2} gutter={0}>
              <Grid.Col md={value}>
                <Accordion p={0} chevronPosition="right">
                  <Accordion.Item value="left_branch">
                    <Accordion.Control>
                      <Title order={4}>{branches.LEFT.name}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {BattlegroupBranchMapping(branches.LEFT, race, data.sbpsData)}
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Grid.Col>

              <Grid.Col md={value}>
                <Accordion p={0} chevronPosition="right">
                  <Accordion.Item value="right_branch">
                    <Accordion.Control>
                      <Title order={4}>{branches.RIGHT.name}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {BattlegroupBranchMapping(branches.RIGHT, race, data.sbpsData)}
                    </Accordion.Panel>
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
