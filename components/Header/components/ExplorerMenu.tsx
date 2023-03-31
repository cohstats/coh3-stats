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
import { IconChevronDown } from "@tabler/icons";
import Link from "next/link";
import React from "react";
import { raceType } from "../../../src/coh3/coh3-types";
import FactionIcon from "../../faction-icon";
import {
  getDPSCalculatorRoute,
  getExplorerFactionRoute,
  getExplorerFactionUnitsRoute,
} from "../../../src/routes";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { getIconsPathOnCDN } from "../../../src/utils";

const explorerFactionLink = (faction: raceType, close: () => void) => {
  const name = faction !== "dak" ? localizedNames[faction] : "DAK";

  return (
    <Stack spacing={4}>
      <Flex direction="row" align="center" gap={"xs"}>
        <FactionIcon name={faction} width={22} />
        <Anchor
          color="orange"
          component={Link}
          href={getExplorerFactionRoute(faction)}
          onClick={close}
        >
          <Text lineClamp={1} weight={500}>
            {name}
          </Text>
        </Anchor>
      </Flex>
      <Divider></Divider>
      <Stack spacing={4}>
        <Group spacing={4}>
          <Image
            width={20}
            height={20}
            fit="contain"
            src={`/icons/races/common/symbols/building_hq.png`}
            alt=""
            withPlaceholder
          />
          <Anchor
            color="orange"
            component={Link}
            href={getExplorerFactionRoute(faction)}
            onClick={close}
          >
            Buildings
          </Anchor>
        </Group>
        <Group spacing={4}>
          <Image
            width={20}
            height={20}
            fit="contain"
            src={`/icons/races/common/symbols/building_barracks.png`}
            alt=""
            withPlaceholder
          />
          <Anchor
            color="orange"
            component={Link}
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

/**
 * @TODO Provide the toolName type for the routes. In the meantime, provide the
 * route fragment as string.
 */
const explorerToolLink = (close: () => void) => {
  return (
    <Group spacing={4}>
      <Image
        width={20}
        height={20}
        fit="contain"
        src={getIconsPathOnCDN("/icons/races/common/symbols/hmg.png")}
        alt=""
        withPlaceholder
      />
      <Text weight={500}>
        <Anchor color="orange" component={Link} href={getDPSCalculatorRoute()} onClick={close}>
          DPS - Unit Comparison
        </Anchor>
      </Text>
    </Group>
  );
};

const ExplorerMenu = ({
  cx,
  classes,
  close,
}: {
  cx: (...args: any) => string;
  classes: Record<string, string>;
  close: () => void;
}) => {
  const mobileView = (
    <Group className={classes.hiddenDesktop} grow>
      <Accordion chevronPosition="right">
        <Accordion.Item value="explorer_menu">
          <Accordion.Control className={cx(classes.link)}>
            <Text fw="bold">Explorer</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              {explorerFactionLink("german", close)}
              {explorerFactionLink("american", close)}
              {explorerFactionLink("dak", close)}
              {explorerFactionLink("british", close)}
            </Stack>
            <Divider my="sm"></Divider>
            <Stack>
              <Text weight={700}>Tools</Text>
              {explorerToolLink(close)}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Group>
  );

  const desktopView = (
    <Group className={classes.hiddenMobile}>
      <HoverCard width={830} position="bottom" radius="md" shadow="md" withinPortal>
        <HoverCard.Target>
          <Anchor href={"/explorer"} className={cx(classes.link)}>
            <Group spacing={3}>
              <Text>Explorer</Text>
              <IconChevronDown className={classes.hiddenMobile} size={16} />
            </Group>
          </Anchor>
        </HoverCard.Target>
        <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
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
              <Stack spacing={4}>
                <Text weight={700}>Tools</Text>
                <Divider />
                {explorerToolLink(() => null)}
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
