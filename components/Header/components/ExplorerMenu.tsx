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
  getWeaponsRoute,
} from "../../../src/routes";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { getIconsPathOnCDN, internalSlash } from "../../../src/utils";
import LinkWithOutPrefetch from "../../LinkWithOutPrefetch";

interface ExplorerMenuProps {
  classes: Record<string, string>;
  close: () => void;
  t: (key: string) => string;
}

const explorerFactionLink = (
  faction: raceType,
  close: () => void,
  t: (key: string) => string,
) => {
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
            w={20}
            h={20}
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
            {t("mainMenu.explMenu.buildings")}
          </Anchor>
        </Group>
        <Group gap={4}>
          <Image
            w={20}
            h={20}
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
            {t("mainMenu.explMenu.units")}
          </Anchor>
        </Group>
      </Stack>
    </Stack>
  );
};

const DPSLink = ({ close, t }: { close?: () => void; t: (key: string) => string }) => {
  return (
    <Group gap={4}>
      <Image
        w={20}
        h={20}
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
          {t("mainMenu.explMenu.dpsCalculator")}
        </Anchor>
      </Text>
    </Group>
  );
};

const UnitBrowserLink = ({ close, t }: { close?: () => void; t: (key: string) => string }) => {
  return (
    <Group gap={4}>
      <Image
        w={20}
        h={20}
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
          {t("mainMenu.explMenu.unitBrowser")}
        </Anchor>
      </Text>
    </Group>
  );
};

const ChallengesLink = ({ close, t }: { close?: () => void; t: (key: string) => string }) => {
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
          {t("mainMenu.explMenu.challenges")}
        </Anchor>
      </Text>
    </Group>
  );
};

const WeaponsLink = ({ close, t }: { close?: () => void; t: (key: string) => string }) => {
  return (
    <Group gap={4}>
      <Image
        w={20}
        h={20}
        fit="contain"
        src={getIconsPathOnCDN("/icons/unit_status/bw2/generic_infantry_boost.png")}
        alt=""
        fallbackSrc={"https://placehold.co/20x20?text=X"}
      />
      <Text fw={500}>
        <Anchor
          c="orange"
          component={LinkWithOutPrefetch}
          href={getWeaponsRoute()}
          onClick={close}
        >
          {t("mainMenu.explMenu.weapons")}
        </Anchor>
      </Text>
    </Group>
  );
};

const ExplorerMenu: React.FC<ExplorerMenuProps> = ({ classes, close, t }) => {
  const mobileView = (
    <Group className={classes.hiddenDesktop} grow>
      <Accordion chevronPosition="right">
        <Accordion.Item value="explorer_menu">
          <Accordion.Control className={classes.link}>
            <Text fw="500">{t("mainMenu.explorer")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              {explorerFactionLink("german", close, t)}
              {explorerFactionLink("american", close, t)}
              {explorerFactionLink("dak", close, t)}
              {explorerFactionLink("british", close, t)}
            </Stack>
            <Divider my="sm"></Divider>
            <Stack gap={4}>
              <Text fw={700}>Tools</Text>
              <DPSLink close={close} t={t} />
              <UnitBrowserLink close={close} t={t} />
              <ChallengesLink close={close} t={t} />
              <WeaponsLink close={close} t={t} />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Group>
  );

  const desktopView = (
    <Group className={classes.hiddenMobile}>
      <HoverCard width={860} position="bottom" radius="md" shadow="md">
        <HoverCard.Target>
          <Anchor href={"/explorer"} component={LinkWithOutPrefetch} className={classes.link}>
            <Group gap={3}>
              {t("mainMenu.explorer")}
              <IconChevronDown className={classes.hiddenMobile} size={16} />
            </Group>
          </Anchor>
        </HoverCard.Target>
        <HoverCard.Dropdown style={{ overflow: "hidden" }}>
          <Grid gutter={8} columns={4}>
            <Grid.Col span={3}>
              <Grid columns={4} align="center">
                <Grid.Col span={1}>{explorerFactionLink("german", () => null, t)}</Grid.Col>
                <Grid.Col span={1}>{explorerFactionLink("american", () => null, t)}</Grid.Col>
                <Grid.Col span={1}>{explorerFactionLink("dak", () => null, t)}</Grid.Col>
                <Grid.Col span={1}>{explorerFactionLink("british", () => null, t)}</Grid.Col>
              </Grid>
            </Grid.Col>
            <Grid.Col span={1}>
              <Stack gap={4}>
                <Text fw={700}>Tools</Text>
                <Divider />
                <DPSLink close={() => null} t={t} />
                <UnitBrowserLink close={() => null} t={t} />
                <ChallengesLink close={() => null} t={t} />
                <WeaponsLink close={() => null} t={t} />
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
