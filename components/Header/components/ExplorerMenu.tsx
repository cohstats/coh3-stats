import { Anchor, Divider, Flex, Grid, Group, HoverCard, Stack, Text } from "@mantine/core";
import config from "../../../config";
import { IconChevronDown } from "@tabler/icons";
import Link from "next/link";
import React from "react";
import { raceType } from "../../../src/coh3/coh3-types";
import FactionIcon from "../../faction-icon";
import { getDPSCalculatorRoute, getExplorerFactionRoute } from "../../../src/routes";
import { localizedNames } from "../../../src/coh3/coh3-data";

const explorerFactionLink = (faction: raceType) => {
  return (
    <Flex direction="row" align="center" gap="md">
      <FactionIcon name={faction} width={24} />
      <Anchor color="orange" component={Link} href={getExplorerFactionRoute(faction)}>
        {localizedNames[faction]}
      </Anchor>
    </Flex>
  );
};

/**
 * @TODO Provide the toolName type for the routes. In the meantime, provide the
 * route fragment as string.
 */
const explorerToolLink = (toolName: string) => (
  <Text>
    <Anchor color="orange" component={Link} href={getDPSCalculatorRoute()}>
      {toolName}
    </Anchor>
  </Text>
);

const ExplorerMenu = ({
  cx,
  classes,
}: {
  cx: (...args: any) => string;
  classes: Record<string, string>;
}) => (
  <HoverCard width={800} position="bottom" radius="md" shadow="md" withinPortal>
    <HoverCard.Target>
      <Anchor href={config.isDevEnv() ? "/explorer" : "#"} className={cx(classes.link)}>
        <Group spacing={3}>
          Explorer
          <IconChevronDown className={classes.hiddenMobile} size={16} />
        </Group>
      </Anchor>
    </HoverCard.Target>
    <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
      <Grid gutter={0} columns={2}>
        <Grid.Col span={1}>
          <Stack>
            {explorerFactionLink("german")}
            {explorerFactionLink("american")}
            {explorerFactionLink("dak")}
            {explorerFactionLink("british")}
          </Stack>
        </Grid.Col>
        <Grid.Col span={1}>
          {/* <Stack>
            <Text weight={700}>Other Stuff</Text>
            <Text>
              <Anchor color="orange" component={Link} href="#">
                Child stuff
              </Anchor>
            </Text>
          </Stack>
          <Divider my="sm" /> */}
          <Stack>
            <Text weight={700}>Tools</Text>
            {explorerToolLink("DPS - Unit Comparison")}
          </Stack>
        </Grid.Col>
      </Grid>
    </HoverCard.Dropdown>
  </HoverCard>
);

export default ExplorerMenu;
