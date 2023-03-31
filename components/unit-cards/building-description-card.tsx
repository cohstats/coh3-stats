import {
  Accordion,
  Anchor,
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
import { UnitDescription, UnitDescriptionCard } from "./unit-description-card";
import { UnitUpgrade, UnitUpgradeCard } from "./unit-upgrade-card";
import { UnitCostCard } from "./unit-cost-card";
import { BuildingType } from "../../src/coh3";
import { hasCost, ResourceValues } from "../../src/unitStats";
import Link from "next/link";
import { raceType } from "../../src/coh3/coh3-types";

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
  units: Array<{ id: string; desc: UnitDescription; time_cost: ResourceValues }>;
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
) => (
  <Grid columns={4}>
    <Grid.Col sm={3}>
      <Flex direction="row" align="center" gap={16}>
        <Image
          width={96}
          height={96}
          fit="contain"
          src={`/icons/${desc.icon_name}.png`}
          alt={desc.screen_name}
          withPlaceholder
        />
        <Flex direction="column" gap={4}>
          <Title order={4} transform="capitalize" lineClamp={1}>
            {desc.screen_name}
          </Title>
          <Text fz="md" lineClamp={2} color="yellow.5">
            {desc.extra_text}
          </Text>
          <Text fz="sm" lineClamp={2}>
            {desc.brief_text}
          </Text>
          <Text fz="sm" lineClamp={1}>
            {desc.help_text}
          </Text>
        </Flex>
      </Flex>
    </Grid.Col>

    <Grid.Col sm={1}>
      <Stack>
        <Divider display={{ base: "block", sm: "none" }} />
        <Flex direction="row" justify="space-between">
          <Flex direction="row" gap={4}>
            {/* <Image
            height={24}
            width={24}
            fit="contain"
            src="/icons/common/orders/reinforce.png"
            alt="Health"
          /> */}
            <Text weight="bold">Hitpoints</Text>
          </Flex>
          <Text ml={24}>{health.hitpoints}</Text>
        </Flex>

        {hasCost(cost) ? (
          <>
            <Divider />
            {UnitCostCard(cost)}
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
      {units.map(({ id, desc, time_cost }) => {
        return (
          <Grid.Col key={id} span={1}>
            <Anchor
              color="undefined"
              underline={false}
              sx={{
                "&:hover": {
                  textDecoration: "none",
                },
              }}
              component={Link}
              href={`/explorer/races/${faction}/units/${id}`}
            >
              <Card p="lg" radius="md" withBorder>
                {UnitDescriptionCard(desc)}
                {UnitCostCard(time_cost)}
              </Card>
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

function BuildingAccordionLabel({ label, symbolIcon }: AccordionLabelProps) {
  return (
    <Group noWrap>
      <Image
        width={24}
        height={24}
        fit="contain"
        src={`/icons/${symbolIcon}.png`}
        alt=""
        withPlaceholder
      />
      <div>
        <Title order={4}>{label}</Title>
        {/* <Text size="sm" color="dimmed" weight={400}>
          {description}
        </Text> */}
      </div>
    </Group>
  );
}

export const BuildingCard = ({
  faction,
  desc,
  units,
  time_cost,
  health,
  upgrades,
}: BuildingSchema) => {
  let productionSection, upgradeSection;

  if (units.length) {
    productionSection = (
      <Accordion.Item value="unit_production">
        <Accordion.Control>
          <BuildingAccordionLabel symbolIcon={desc.symbol_icon_name} label={"Produces"} />
        </Accordion.Control>
        <Accordion.Panel>{BuildingUnitMapper(units, faction)}</Accordion.Panel>
      </Accordion.Item>
    );
  }

  if (upgrades.length) {
    upgradeSection = (
      <Accordion.Item value="upgrades">
        <Accordion.Control>
          <BuildingAccordionLabel symbolIcon={desc.symbol_icon_name} label={"Upgrades"} />
        </Accordion.Control>
        <Accordion.Panel>{BuildingUpgradeMapper(upgrades)}</Accordion.Panel>
      </Accordion.Item>
    );
  }

  return (
    <Flex direction="column" gap={8}>
      {BuildingCardHeader(desc, time_cost, health)}

      <Divider mt={8}></Divider>

      <Accordion multiple chevronPosition="right">
        {productionSection}
        {upgradeSection}
      </Accordion>
    </Flex>
  );
};
