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
import { getLeaderBoardStatsRoute } from "../../../src/routes";
import React from "react";
import { IconBarrierBlock, IconChevronDown } from "@tabler/icons";

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
              <Anchor component={Link} href={getLeaderBoardStatsRoute()} onClick={close}>
                Leaderboards Statistics
              </Anchor>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );

  const desktopView = (
    <div className={classes.hiddenMobile}>
      <HoverCard width={200} position="bottom" radius="md" shadow="md" withinPortal>
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
            <Anchor component={Link} href={getLeaderBoardStatsRoute()}>
              Leaderboards Statistics
            </Anchor>
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
                  <span> Game Statistics</span>
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
