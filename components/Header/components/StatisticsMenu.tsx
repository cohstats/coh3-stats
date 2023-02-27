import {
  Accordion,
  ActionIcon,
  Anchor,
  Group,
  HoverCard,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import {
  getGameStatsRoute,
  getLeaderBoardStatsRoute,
  getPlayersStatsRoute,
} from "../../../src/routes";
import React from "react";
import {
  IconBarrierBlock,
  IconChartAreaLine,
  IconChevronDown,
  IconDeviceDesktopAnalytics,
  IconUsersGroup,
} from "@tabler/icons-react";

const StatisticsMenu = ({
  cx,
  classes,
  close,
}: {
  cx: (...args: any) => string;
  classes: Record<string, string>;
  close: () => void;
}) => {
  const mobileView = (
    <div className={classes.hiddenDesktop}>
      <Accordion chevronPosition="right">
        <Accordion.Item value="explorer_menu">
          <Accordion.Control className={cx(classes.link)}>
            <Text fw="bold">Statistics</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Group spacing={"xs"}>
                <IconChartAreaLine size={16} />
                <Anchor component={Link} href={getGameStatsRoute()}>
                  Games Stats
                </Anchor>
              </Group>
              <Group spacing={"xs"}>
                <IconUsersGroup size={16} />
                <Anchor component={Link} href={getPlayersStatsRoute()} onClick={close}>
                  Player Stats
                </Anchor>
              </Group>
              <Group spacing={"xs"}>
                <IconDeviceDesktopAnalytics size={16} />
                <Anchor component={Link} href={getLeaderBoardStatsRoute()} onClick={close}>
                  Leaderboards Stats
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
            <Group spacing={3} className={cx(classes.link)}>
              Statistics
              <IconChevronDown size={16} />
            </Group>
          </div>
        </HoverCard.Target>
        <HoverCard.Dropdown sx={{ overflow: "hidden" }} style={{ textAlign: "left" }}>
          <Group>
            <Group spacing={"xs"}>
              <IconChartAreaLine size={16} />
              <Anchor component={Link} href={getGameStatsRoute()}>
                Games Stats
              </Anchor>
            </Group>
            <Group spacing={"xs"}>
              <IconUsersGroup size={16} />
              <Anchor component={Link} href={getPlayersStatsRoute()}>
                Players Stats
              </Anchor>
            </Group>
            <Group spacing={"xs"}>
              <IconDeviceDesktopAnalytics size={16} />
              <Anchor component={Link} href={getLeaderBoardStatsRoute()}>
                Leaderboards Stats
              </Anchor>
            </Group>
            <Tooltip label="Coming Later" color="orange" withArrow position={"bottom"}>
              <Anchor
                className={cx(classes.disabledLink)}
                component={Link}
                href={getLeaderBoardStatsRoute()}
              >
                <Group spacing={"xs"}>
                  <ActionIcon color="orange" size="sm" radius="xl" variant="transparent">
                    <IconBarrierBlock size={16} />
                  </ActionIcon>
                  <span> Map Statistics</span>
                </Group>
              </Anchor>
            </Tooltip>
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
