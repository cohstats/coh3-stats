import {
  Accordion,
  Anchor,
  Box,
  Card,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { UnitDescriptionCard } from "./unit-description-card";
import { UnitUpgrade, UnitUpgradeCard } from "./unit-upgrade-card";
import { UnitCostCard } from "./unit-cost-card";
import { BuildingType } from "../../src/coh3";
import { hasCost, ResourceValues, SbpsType, UpgradesType } from "../../src/unitStats";
import { raceType } from "../../src/coh3/coh3-types";
import { getExplorerUnitRoute } from "../../src/routes";
import { RequirementCard } from "./requirement-card";
import { getIconsPathOnCDN } from "../../src/utils";

import classes from "./Unit.module.css";
import LinkWithOutPrefetch from "../LinkWithOutPrefetch";

type BuildingDescription = {
  /** Locstring value. Found at `screen_name/locstring/value`. */
  screen_name: string;
  /** Locstring value. Found at `help_text/locstring/value`. */
  help_text: string;
  /** Locstring value. Found at `extra_text/locstring/value`. */
  extra_text: string;
  /** Locstring value. Found at `brief_text/locstring/value`. */
  brief_text: string;
  /** File path. Found at `icon_name`. */
  icon_name: string;
  /** File path. Found at `symbol_icon_name`. */
  symbol_icon_name: string;
};

export type BuildingSchema = {
  faction: raceType;
  types: BuildingType[];
  desc: BuildingDescription;
  /** Extracted from `ebpextensions\\spawner_ext` within the building `ebps`. */
  units: Array<SbpsType & { time_cost: ResourceValues; playerReq: UpgradesType[] }>;
  /** Extracted from `ebpextensions\\cost_ext` within the building `ebps`. */
  time_cost: ResourceValues;
  /**
   * @todo Do we need this?
   * Extracted from `ebpextensions\\ability_ext` within the building `ebps`.
   */
  abilities?: []; // Unused right now.
  /** Extracted from `ebpextensions\\upgrade_ext` within the building `ebps`. */
  upgrades: UnitUpgrade[];
  health: { hitpoints: number };
  t: (key: string) => string;
};

/**
 * @todo Shall we re-use the `unit_upgrade_card` instead? Only change is the
 * icon side. In the meantime, use this in case of new UI requirements for this
 * type of card.
 */
const BuildingCardHeader = (
  desc: BuildingDescription,
  cost: ResourceValues,
  health: BuildingSchema["health"],
  t: (key: string) => string,
) => (
  <Grid columns={4}>
    <Grid.Col span={3}>
      <Flex direction="row" align="center" gap={16}>
        <Image
          w={96}
          h={96}
          fit="contain"
          src={getIconsPathOnCDN(`icons/${desc.icon_name}.webp`)}
          alt={desc.screen_name}
        />
        <Flex direction="column" gap={4}>
          <Title order={3} size="h3" style={{ textTransform: "capitalize" }} lineClamp={1}>
            {desc.screen_name}
          </Title>
          <Title order={5} lineClamp={2} c="yellow.5">
            {desc.extra_text}
          </Title>
          <Text fz="sm" lineClamp={2}>
            {desc.brief_text}
          </Text>
          <Text fz="sm" lineClamp={1}>
            {desc.help_text}
          </Text>
        </Flex>
      </Flex>
    </Grid.Col>

    <Grid.Col span={1}>
      <Stack>
        <Divider display={{ base: "block", sm: "none" }} />
        <Flex direction="row" justify="space-between">
          <Flex direction="row" gap={4}>
            <Text style={{ fontWeight: "bold" }}>{t("common.hitpoints")}</Text>
          </Flex>
          <Text ml={24}>{health.hitpoints}</Text>
        </Flex>

        {hasCost(cost) ? (
          <>
            <Divider />
            {UnitCostCard(cost, t("common.costs"))}
          </>
        ) : (
          <></>
        )}
      </Stack>
    </Grid.Col>
  </Grid>
);

const BuildingUpgradeMapper = (upgrades: BuildingSchema["upgrades"]) => {
  if (!upgrades.length) return <></>;
  return (
    <Grid columns={1}>
      {upgrades.map(({ id, desc, time_cost }) => {
        return (
          <Grid.Col key={id} span={1}>
            <Card p="lg" radius="md" withBorder>
              {UnitUpgradeCard({ id, desc, time_cost })}
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

const BuildingUnitMapper = (units: BuildingSchema["units"], faction: raceType) => {
  if (!units.length) return <></>;
  return (
    <Grid columns={1}>
      {units.map(({ id, ui, time_cost, playerReq }) => {
        const reqCards = playerReq.length ? (
          <Group justify="space-between">
            {playerReq.map((upg) => (
              <div key={upg.id}>{RequirementCard(upg)}</div>
            ))}
          </Group>
        ) : (
          <></>
        );

        return (
          <Grid.Col key={id} span={1}>
            <Anchor
              underline={"never"}
              style={{
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  textDecoration: "none",
                },
              }}
              component={LinkWithOutPrefetch}
              href={getExplorerUnitRoute(faction as raceType, id)}
            >
              <Box p="lg" className={classes.buildingBuildCard}>
                <Grid columns={5} align="center">
                  <Grid.Col span={playerReq.length ? 4 : 5}>
                    <Stack gap={16}>
                      <UnitDescriptionCard
                        faction={faction}
                        desc={{
                          screen_name: ui.screenName,
                          help_text: ui.helpText,
                          brief_text: ui.briefText,
                          symbol_icon_name: ui.symbolIconName,
                          icon_name: ui.iconName,
                        }}
                        placement="building"
                      />
                      <Flex>{hasCost(time_cost) ? UnitCostCard(time_cost) : <></>}</Flex>
                    </Stack>
                  </Grid.Col>
                  {playerReq.length ? (
                    <Grid.Col span={1}>
                      <Flex justify="center">{reqCards}</Flex>
                    </Grid.Col>
                  ) : (
                    <></>
                  )}
                </Grid>
              </Box>
            </Anchor>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

interface AccordionLabelProps {
  /** Symbol icon path */
  symbolIcon: string;
  label: string;
}

const BuildingAccordionLabel = ({ label, symbolIcon }: AccordionLabelProps) => {
  return (
    <Group wrap="nowrap">
      <Image
        w={24}
        h={24}
        fit="contain"
        src={getIconsPathOnCDN(`icons/${symbolIcon}.webp`)}
        alt=""
      />
      <div>
        <Title order={4}>{label}</Title>
      </div>
    </Group>
  );
};

export const BuildingCard = ({
  faction,
  desc,
  units,
  time_cost,
  health,
  upgrades,
  t,
}: BuildingSchema) => {
  let productionSection, upgradeSection;

  if (units.length) {
    productionSection = (
      <Accordion.Item value="unit_production">
        <Accordion.Control>
          <BuildingAccordionLabel
            symbolIcon={desc.symbol_icon_name}
            label={t("common.produces")}
          />
        </Accordion.Control>
        <Accordion.Panel>{BuildingUnitMapper(units, faction)}</Accordion.Panel>
      </Accordion.Item>
    );
  }

  if (upgrades.length) {
    upgradeSection = (
      <Accordion.Item value="upgrades">
        <Accordion.Control>
          <BuildingAccordionLabel
            symbolIcon={desc.symbol_icon_name}
            label={t("common.upgrades")}
          />
        </Accordion.Control>
        <Accordion.Panel>{BuildingUpgradeMapper(upgrades)}</Accordion.Panel>
      </Accordion.Item>
    );
  }

  return (
    <Flex direction="column" gap={8}>
      {BuildingCardHeader(desc, time_cost, health, t)}

      <Divider mt={8} />

      <Accordion multiple chevronPosition="right">
        {productionSection}
        {upgradeSection}
      </Accordion>
    </Flex>
  );
};
