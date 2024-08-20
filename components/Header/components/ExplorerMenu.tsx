import {
  Accordion,
  Anchor,
  Divider,
  Flex,
  Grid,
  Group,
  HoverCard,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import { IconChevronDown, IconMedal } from "@tabler/icons-react";
import React from "react";
import { raceType } from "../../../src/coh3/coh3-types";
import FactionIcon from "../../faction-icon";
import {
  getChallengesRoute,
  getDPSCalculatorRoute,
  getExplorerFactionRoute,
  getExplorerFactionUnitsRoute,
  getUnitBrowserRoute,
} from "../../../src/routes";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { getIconsPathOnCDN, internalSlash } from "../../../src/utils";
import LinkWithOutPrefetch from "../../LinkWithOutPrefetch";

const explorerFactionLink = (faction: raceType, close?: () => void) => {
  const name = faction !== "dak" ? localizedNames[faction] : "DAK";

  return (
    <Stack gap={4}>
      <Flex direction="row" align="center" gap={"xs"}>
        <FactionIcon name={faction} width={22} />
        <Anchor
          c="orange"
          component={LinkWithOutPrefetch}
          href={getExplorerFactionRoute(faction)}
          onClick={close}
        >
          <Text lineClamp={1} fw={500}>
            {name}
          </Text>
        </Anchor>
      </Flex>
      <Divider></Divider>
      <Stack gap={4}>
        <Group gap={4}>
          <Image
            width={20}
            height={20}
            fit="contain"
            src={getIconsPathOnCDN(`/icons/races/common/symbols/building_hq.webp`)}
            alt=""
            fallbackSrc={"https://placehold.co/20x20?text=X"}
          />
          <Anchor
            c="orange"
            component={LinkWithOutPrefetch}
            href={getExplorerFactionRoute(faction)}
            onClick={close}
          >
            Buildings
          </Anchor>
        </Group>
        <Group gap={4}>
          <Image
            width={20}
            height={20}
            fit="contain"
            src={getIconsPathOnCDN(`/icons/races/common/symbols/building_barracks.webp`)}
            alt=""
            fallbackSrc={"https://placehold.co/20x20?text=X"}
          />
          <Anchor
            c="orange"
            component={LinkWithOutPrefetch}
            href={getExplorerFactionUnitsRoute(faction)}
            onClick={close}
          >
            Units
          </Anchor>
        </Group>
      </Stack>
    </Stack>
  );
};

const DPSLink = ({ close }: { close?: () => void }) => {
  return (
    <Group gap={4}>
      <Image
        width={20}
        height={20}
        fit="contain"
        src={getIconsPathOnCDN("/icons/races/common/symbols/hmg.png")}
        alt=""
        fallbackSrc={"https://placehold.co/20x20?text=X"}
      />
      <Text fw={500}>
        <Anchor
          c="orange"
          component={LinkWithOutPrefetch}
          href={getDPSCalculatorRoute()}
          onClick={close}
        >
          DPS - Unit Comparison
        </Anchor>
      </Text>
    </Group>
  );
};

const UnitBrowserLink = ({ close }: { close?: () => void }) => {
  return (
    <Group gap={4}>
      <Image
        width={20}
        height={20}
        fit="contain"
        src={internalSlash("/unitStats/weaponClass/supportinfantry_icn.png")}
        alt=""
        fallbackSrc={"https://placehold.co/20x20?text=X"}
      />
      <Text fw={500}>
        <Anchor
          c="orange"
          component={LinkWithOutPrefetch}
          href={getUnitBrowserRoute()}
          onClick={close}
        >
          Unit Browser
        </Anchor>
      </Text>
    </Group>
  );
};

const ChallengesLink = ({ close }: { close?: () => void }) => {
  return (
    <Group gap={4}>
      <IconMedal size={20} />
      <Text fw={500}>
        <Anchor
          c="orange"
          component={LinkWithOutPrefetch}
          href={getChallengesRoute()}
          onClick={close}
        >
          Challenges
        </Anchor>
      </Text>
    </Group>
  );
};

const ExplorerMenu = ({
  classes,
  close,
}: {
  classes: Record<string, string>;
  close?: () => void;
}) => {
  const mobileView = (
    <Group className={classes.hiddenDesktop} grow>
      <Accordion chevronPosition="right">
        <Accordion.Item value="explorer_menu">
          <Accordion.Control className={classes.link}>
            <Text inherit fw={700}>
              Explorer
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              {explorerFactionLink("german", close)}
              {explorerFactionLink("american", close)}
              {explorerFactionLink("dak", close)}
              {explorerFactionLink("british", close)}
            </Stack>
            <Divider my="sm"></Divider>
            <Stack gap={4}>
              <Text fw={700}>Tools</Text>
              <DPSLink close={close} />
              <UnitBrowserLink close={close} />
              <ChallengesLink close={close} />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Group>
  );

  const desktopView = (
    <Group className={classes.hiddenMobile}>
      <HoverCard width={840} position="bottom" radius="md" shadow="md">
        <HoverCard.Target>
          <Anchor href={"/explorer"} component={LinkWithOutPrefetch} className={classes.link}>
            <Group gap={3}>
              <Text>Explorer</Text>
              <IconChevronDown className={classes.hiddenMobile} size={16} />
            </Group>
          </Anchor>
        </HoverCard.Target>
        <HoverCard.Dropdown style={{ overflow: "hidden" }}>
          <Grid gutter={8} columns={4}>
            <Grid.Col span={3}>
              <Grid columns={4} align="center">
                <Grid.Col span={1}>{explorerFactionLink("german", () => null)}</Grid.Col>
                <Grid.Col span={1}>{explorerFactionLink("american", () => null)}</Grid.Col>
                <Grid.Col span={1}>{explorerFactionLink("dak", () => null)}</Grid.Col>
                <Grid.Col span={1}>{explorerFactionLink("british", () => null)}</Grid.Col>
              </Grid>
            </Grid.Col>
            <Grid.Col span={1}>
              <Stack gap={4}>
                <Text fw={700}>Tools</Text>
                <Divider />
                <DPSLink close={() => null} />
                <UnitBrowserLink close={() => null} />
                <ChallengesLink close={() => null} />
              </Stack>
            </Grid.Col>
          </Grid>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );

  return (
    <>
      {desktopView}
      {mobileView}
    </>
  );
};

export default ExplorerMenu;
