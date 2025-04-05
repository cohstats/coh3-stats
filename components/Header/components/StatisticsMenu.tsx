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

interface StatisticsMenuProps {
  classes: Record<string, string>;
  close?: () => void;
  t: (key: string) => string;
}

const StatisticsMenu: React.FC<StatisticsMenuProps> = ({ classes, close, t }) => {
  const mobileView = (
    <div className={classes.hiddenDesktop}>
      <Accordion chevronPosition="right">
        <Accordion.Item value="explorer_menu">
          <Accordion.Control className={classes.link}>
            <Text fw="500">{t("mainMenu.statistics")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Group gap={"xs"}>
                <IconChartAreaLine size={16} />
                <Anchor component={Link} href={getGameStatsRoute()} onClick={close}>
                  {t("mainMenu.statsMenu.games")}
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconChartArea size={16} />
                <Anchor component={Link} href={getMapsStatsRoute()} onClick={close}>
                  {t("mainMenu.statsMenu.maps")}
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconUsersGroup size={16} />
                <Anchor component={Link} href={getPlayersStatsRoute()} onClick={close}>
                  {t("mainMenu.statsMenu.players")}
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconDeviceDesktopAnalytics size={16} />
                <Anchor component={Link} href={getLeaderBoardStatsRoute()} onClick={close}>
                  {t("mainMenu.statsMenu.leaderboards")}
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconTrophy size={16} />
                <Anchor component={Link} href={getGlobalAchievementsStatsRoute()} onClick={close}>
                  {t("mainMenu.statsMenu.achievements")}
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
              {t("mainMenu.statistics")}
              <IconChevronDown size={16} />
            </Group>
          </div>
        </HoverCard.Target>
        <HoverCard.Dropdown style={{ textAlign: "left", overflow: "hidden" }}>
          <Group>
            <Group gap={"xs"}>
              <IconChartAreaLine size={16} />
              <Anchor component={Link} href={getGameStatsRoute()}>
                {t("mainMenu.statsMenu.games")}
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconChartArea size={16} />
              <Anchor component={Link} href={getMapsStatsRoute()}>
                {t("mainMenu.statsMenu.maps")}
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconUsersGroup size={16} />
              <Anchor component={Link} href={getPlayersStatsRoute()}>
                {t("mainMenu.statsMenu.players")}
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconDeviceDesktopAnalytics size={16} />
              <Anchor component={Link} href={getLeaderBoardStatsRoute()}>
                {t("mainMenu.statsMenu.leaderboards")}
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconTrophy size={16} />
              <Anchor component={Link} href={getGlobalAchievementsStatsRoute()}>
                {t("mainMenu.statsMenu.achievements")}
              </Anchor>
            </Group>
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
