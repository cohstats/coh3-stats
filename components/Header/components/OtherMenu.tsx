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
import { getOpenDataRoute, getRankingTiersRoute } from "../../../src/routes";
import React from "react";
import {
  IconActivity,
  IconBarrierBlock,
  IconChevronDown,
  IconDatabaseShare,
  IconAward,
} from "@tabler/icons-react";

const OtherMenu = ({
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
            <Text fw="bold">Other</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Group spacing={"xs"}>
                <IconDatabaseShare size={16} />
                <Anchor component={Link} href={getOpenDataRoute()} onClick={close}>
                  Open Data
                </Anchor>
              </Group>
              <Group spacing={"xs"}>
                <IconActivity size={16} />
                <Anchor
                  component={Link}
                  href={"https://stats.uptimerobot.com/03lN1ckr5j"}
                  target={"_blank"}
                  onClick={close}
                >
                  Relic API Status
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
      <HoverCard width={200} position="bottom" radius="md" shadow="md">
        <HoverCard.Target>
          <div>
            <Group spacing={3} className={cx(classes.link)}>
              Other
              <IconChevronDown size={16} />
            </Group>
          </div>
        </HoverCard.Target>
        <HoverCard.Dropdown sx={{ overflow: "hidden" }} style={{ textAlign: "left" }}>
          <Group>
            <Group spacing={"xs"}>
              <IconAward size={16} />
              <Anchor component={Link} href={getRankingTiersRoute()}>
                Ranking Tiers
              </Anchor>
            </Group>
            <Group spacing={"xs"}>
              <IconDatabaseShare size={16} />
              <Anchor component={Link} href={getOpenDataRoute()}>
                Open Data
              </Anchor>
            </Group>
            <Group spacing={"xs"}>
              <IconActivity size={16} />
              <Anchor
                component={Link}
                href={"https://stats.uptimerobot.com/03lN1ckr5j"}
                target={"_blank"}
              >
                Relic API Status
              </Anchor>
            </Group>
            <Tooltip label="Coming Later" color="orange" withArrow position={"bottom"}>
              <Anchor
                className={cx(classes.disabledLink)}
                component={Link}
                href={getOpenDataRoute()}
              >
                <Group spacing={"xs"}>
                  <ActionIcon color="orange" radius="xl" variant="transparent">
                    <IconBarrierBlock size={16} />
                  </ActionIcon>
                  <span> Night-bot API</span>
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

export default OtherMenu;
