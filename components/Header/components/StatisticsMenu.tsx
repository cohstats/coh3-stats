import { Accordion, Anchor, Group, HoverCard, Stack, Text } from "@mantine/core";
import Link from "next/link";
import {
  getGameStatsRoute,
  getGlobalAchievementsStatsRoute,
  getLeaderBoardStatsRoute,
  getMapsStatsRoute,
  getPlayersStatsRoute,
} from "../../../src/routes";
import React from "react";
import {
  IconChartArea,
  IconChartAreaLine,
  IconChevronDown,
  IconDeviceDesktopAnalytics,
  IconTrophy,
  IconUsersGroup,
} from "@tabler/icons-react";

const StatisticsMenu = ({
  classes,
  close,
}: {
  classes: Record<string, string>;
  close?: () => void;
}) => {
  const mobileView = (
    <div className={classes.hiddenDesktop}>
      <Accordion chevronPosition="right">
        <Accordion.Item value="explorer_menu">
          <Accordion.Control className={classes.link}>
            <Text fw="500">Statistics</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Group gap={"xs"}>
                <IconChartAreaLine size={16} />
                <Anchor component={Link} href={getGameStatsRoute()} onClick={close}>
                  Games Stats
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconChartArea size={16} />
                <Anchor component={Link} href={getMapsStatsRoute()} onClick={close}>
                  Maps Stats
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconUsersGroup size={16} />
                <Anchor component={Link} href={getPlayersStatsRoute()} onClick={close}>
                  Player Stats
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconDeviceDesktopAnalytics size={16} />
                <Anchor component={Link} href={getLeaderBoardStatsRoute()} onClick={close}>
                  Leaderboards Stats
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconTrophy size={16} />
                <Anchor component={Link} href={getGlobalAchievementsStatsRoute()} onClick={close}>
                  Achievements Stats
                </Anchor>
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );

  const desktopView = (
    <div className={classes.hiddenMobile}>
      <HoverCard width={220} position="bottom" radius="md" shadow="md">
        <HoverCard.Target>
          <div>
            <Group gap={3} className={classes.link}>
              Statistics
              <IconChevronDown size={16} />
            </Group>
          </div>
        </HoverCard.Target>
        <HoverCard.Dropdown style={{ textAlign: "left", overflow: "hidden" }}>
          <Group>
            <Group gap={"xs"}>
              <IconChartAreaLine size={16} />
              <Anchor component={Link} href={getGameStatsRoute()}>
                Games Stats
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconChartArea size={16} />
              <Anchor component={Link} href={getMapsStatsRoute()}>
                Maps Stats
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconUsersGroup size={16} />
              <Anchor component={Link} href={getPlayersStatsRoute()}>
                Players Stats
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconDeviceDesktopAnalytics size={16} />
              <Anchor component={Link} href={getLeaderBoardStatsRoute()}>
                Leaderboards Stats
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconTrophy size={16} />
              <Anchor component={Link} href={getGlobalAchievementsStatsRoute()}>
                Achievements Stats
              </Anchor>
            </Group>
            {/*<Tooltip label="Coming Later" color="orange" withArrow position={"bottom"}>*/}
            {/*  <Anchor*/}
            {/*    className={cx(classes.disabledLink)}*/}
            {/*    component={Link}*/}
            {/*    href={getLeaderBoardStatsRoute()}*/}
            {/*  >*/}
            {/*    <Group gap={"xs"}>*/}
            {/*      <ActionIcon color="orange" size="sm" radius="xl" variant="transparent">*/}
            {/*        <IconBarrierBlock size={16} />*/}
            {/*      </ActionIcon>*/}
            {/*      <span> Map Statistics</span>*/}
            {/*    </Group>*/}
            {/*  </Anchor>*/}
            {/*</Tooltip>*/}
          </Group>
        </HoverCard.Dropdown>
      </HoverCard>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
};

export default StatisticsMenu;
