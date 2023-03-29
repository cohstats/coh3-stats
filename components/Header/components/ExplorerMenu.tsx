import {
  Accordion,
  Anchor,
  Divider,
  Flex,
  Grid,
  Group,
  HoverCard,
  Stack,
  Text,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons";
import Link from "next/link";
import React from "react";
import { raceType } from "../../../src/coh3/coh3-types";
import FactionIcon from "../../faction-icon";
import { getDPSCalculatorRoute, getExplorerFactionRoute } from "../../../src/routes";
import { localizedNames } from "../../../src/coh3/coh3-data";

const explorerFactionLink = (faction: raceType, close: () => void) => {
  return (
    <Flex direction="row" align="center" gap="md">
      <FactionIcon name={faction} width={24} />
      <Anchor
        color="orange"
        component={Link}
        href={getExplorerFactionRoute(faction)}
        onClick={close}
      >
        {localizedNames[faction]}
      </Anchor>
    </Flex>
  );
};

/**
 * @TODO Provide the toolName type for the routes. In the meantime, provide the
 * route fragment as string.
 */
const explorerToolLink = (toolName: string, close: () => void) => (
  <Text>
    <Anchor color="orange" component={Link} href={getDPSCalculatorRoute()} onClick={close}>
      {toolName}
    </Anchor>
  </Text>
);

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
              {explorerToolLink("DPS - Unit Comparison", close)}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Group>
  );

  const desktopView = (
    <Group className={classes.hiddenMobile}>
      <HoverCard width={800} position="bottom" radius="md" shadow="md" withinPortal>
        <HoverCard.Target>
          <Anchor href={"/explorer"} className={cx(classes.link)}>
            <Group spacing={3}>
              <Text>Explorer</Text>
              <IconChevronDown className={classes.hiddenMobile} size={16} />
            </Group>
          </Anchor>
        </HoverCard.Target>
        <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
          <Grid gutter={0} columns={2}>
            <Grid.Col span={1}>
              <Stack>
                {explorerFactionLink("german", () => null)}
                {explorerFactionLink("american", () => null)}
                {explorerFactionLink("dak", () => null)}
                {explorerFactionLink("british", () => null)}
              </Stack>
            </Grid.Col>
            <Grid.Col span={1}>
              <Stack>
                <Text weight={700}>Tools</Text>
                {explorerToolLink("DPS - Unit Comparison", () => null)}
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
