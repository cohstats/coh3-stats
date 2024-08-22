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
  Tooltip,
  Select,
  HoverCard,
  Image,
  BackgroundImage,
  Text,
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
  hasCost,
  BattlegroupArrows,
  BattlegroupBackgrounds,
} from "../../src/unitStats";
import { bgWorkarounds } from "../../src/unitStats/workarounds";
import { UnitUpgradeCard } from "./unit-upgrade-card";
import { useToggle } from "@mantine/hooks";
import { IconAdjustments } from "@tabler/icons-react";
import { getExplorerUnitRoute } from "../../src/routes";
import ImageWithFallback, { iconPlaceholder } from "../placeholders";
import { getIconsPathOnCDN } from "../../src/utils";
import { UnitCostCard } from "./unit-cost-card";
import { Fragment } from "react";

import classes from "./Unit.module.css";

function groupBy<T, K extends string | number>(arr: T[], fn: (item: T) => K) {
  return arr.reduce<Record<K, T[]>>(
    (prev, curr) => {
      const groupKey = fn(curr);
      const group = prev[groupKey] || [];
      group.push(curr);
      return { ...prev, [groupKey]: group };
    },
    {} as Record<K, T[]>,
  );
}

export const BattlegroupCard = (
  race: raceType,
  data: {
    battlegroupData: BattlegroupsType[];
    abilitiesData: AbilitiesType[];
    upgradesData: UpgradesType[];
    sbpsData: SbpsType[];
  },
) => {
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
                <ActionIcon
                  variant="transparent"
                  color={["yellow.6", "blue.6"][value - 1]}
                  onClick={() => toggle()}
                >
                  <IconAdjustments />
                </ActionIcon>
              </Tooltip>
            </Flex>

            {/* Branches Section */}
            <Divider my={12} size="md"></Divider>

            <Grid columns={2} gutter={0}>
              <Grid.Col span={value}>
                <Accordion p={0} chevronPosition="right" variant="filled">
                  <Accordion.Item value="left_branch">
                    <Accordion.Control>
                      <Title order={4}>{branches.LEFT.name}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {BattlegroupBranchMapping(branches.LEFT, race, data.sbpsData, value === 1)}
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Grid.Col>

              <Grid.Col span={value}>
                <Accordion p={0} chevronPosition="right" variant="filled">
                  <Accordion.Item value="right_branch">
                    <Accordion.Control>
                      <Title order={4}>{branches.RIGHT.name}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {BattlegroupBranchMapping(branches.RIGHT, race, data.sbpsData, value === 1)}
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

const BattlegroupBranchMapping = (
  branch: BattlegroupResolvedBranchType,
  faction: raceType,
  sbpsData: SbpsType[],
  compact: boolean = false,
) => {
  const router = useRouter();

  const groupedRows = groupBy(branch.upgrades, (item) => item.upg.uiPosition.row);

  const factionBackgroundSrc = BattlegroupBackgrounds[faction];

  // Create a series of grid elements per row.
  const bgCallInCard = ({ upg, ability }: { upg: UpgradesType; ability: AbilitiesType }) => {
    const costs = {
      manpower: ability.cost.manpower,
      munition: ability.cost.munition,
      fuel: ability.cost.fuel,
      popcap: ability.cost.popcap,
      time_seconds: ability.rechargeTime,
      command: upg.cost.command,
    };

    const spaceRegex = /\\r?\\n|\\r|\\n/g;
    const specialRegex = /\*/g;

    const briefTextFormatter = ability.ui.briefTextFormatter || upg.ui.briefTextFormatter;
    const briefText =
      upg.ui.briefText?.replace(spaceRegex, "\n")?.replace(specialRegex, "") ||
      briefTextFormatter?.replace(spaceRegex, "\n")?.replace(specialRegex, "");

    const extraTextFormatter = ability.ui.extraTextFormatter || upg.ui.extraTextFormatter;
    const extraText = extraTextFormatter.replace(spaceRegex, "\n")?.replace(specialRegex, "");

    return (
      <Box p="sm" w="100%" h="100%" className={classes.bgCardBorder}>
        <Flex direction="column" h="100%" gap={16} justify="space-between">
          <Flex direction="row" gap={16}>
            <BackgroundImage w={80} src={getIconsPathOnCDN(factionBackgroundSrc)} radius="md">
              <ImageWithFallback
                width={80}
                height={80}
                src={`/icons/${upg.ui.iconName}.webp`}
                alt={ability.ui.screenName || upg.ui.screenName || ""}
                fallbackSrc={iconPlaceholder}
              ></ImageWithFallback>
            </BackgroundImage>

            <Stack gap={2} justify="center">
              <Title order={6} style={{ textTransform: "capitalize" }} c="yellow.5" lineClamp={1}>
                {ability.ui.helpText || "Ability / Call In"}
              </Title>
              <Title order={5} style={{ textTransform: "capitalize" }} lineClamp={2}>
                {ability.ui.screenName || upg.ui.screenName}
              </Title>
            </Stack>
          </Flex>

          <Tooltip.Floating multiline style={{ whiteSpace: "pre-line" }} label={briefText}>
            <Stack gap={8} justify="flex-start" style={{ flexGrow: 1 }}>
              <Text
                fz="sm"
                lineClamp={7}
                style={{ whiteSpace: "pre-line", textAlign: "justify" }}
              >
                {briefText}
              </Text>
              <Text
                fz="sm"
                lineClamp={7}
                style={{ whiteSpace: "pre-line", textAlign: "justify", fontStyle: "italic" }}
              >
                {extraText}
              </Text>
            </Stack>
          </Tooltip.Floating>
          <Flex>{hasCost(costs) ? UnitCostCard(costs) : <></>}</Flex>
        </Flex>
      </Box>
    );
  };

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
        underline={"never"}
        style={{
          textDecoration: "none",
          color: "inherit",
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
      <Title order={4} c="orange.5" style={{ textTransform: "uppercase" }}>
        {branch.name}
      </Title>

      {Object.entries(groupedRows).map(([rowIndex, branchUpgrades], currIdx, ogArray) => {
        const nextItem = ogArray[currIdx + 1];
        let arrowOptionSrc = BattlegroupArrows.AVAILABLE_1X1;
        if (nextItem?.[1].length === 2) {
          if (branchUpgrades.length === 1) {
            arrowOptionSrc = BattlegroupArrows.AVAILABLE_1X2;
          } else {
            arrowOptionSrc = BattlegroupArrows.AVAILABLE_2X2;
          }
        } else {
          if (branchUpgrades.length === 2) {
            arrowOptionSrc = BattlegroupArrows.AVAILABLE_2X1;
          }
        }
        const rowNumber = parseInt(rowIndex);
        return (
          <Stack key={`${rowIndex}_${branch.name}`} gap={0} w="100%">
            <Grid columns={branchUpgrades.length === 1 ? 4 : 2} grow>
              {branchUpgrades.map(({ upg, ability, spawnItems }) => {
                return (
                  <Fragment key={upg.id}>
                    <Grid.Col
                      key={`${upg.id}-card`}
                      offset={branchUpgrades.length === 1 && !compact ? 1 : 0}
                      span={branchUpgrades.length === 1 && !compact ? 2 : 1}
                    >
                      {spawnItems.length
                        ? anchorLinkOrSelect({ spawnItems, upg, ability })
                        : bgCallInCard({ upg, ability })}
                    </Grid.Col>
                    {branchUpgrades.length === 1 && !compact ? (
                      <Grid.Col key={`${upg.id}-spacing`} span={1}></Grid.Col>
                    ) : (
                      <></>
                    )}
                  </Fragment>
                );
              })}
            </Grid>
            {/* Avoid the last row spawning arrows with this small check */}
            {rowNumber < 3 ? (
              <Flex justify="center">
                <Image
                  fit="scale-down"
                  height={128}
                  style={{ margin: "auto" }}
                  src={getIconsPathOnCDN(arrowOptionSrc)}
                  alt={"Battle group arrow option"}
                />
              </Flex>
            ) : (
              <></>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};
