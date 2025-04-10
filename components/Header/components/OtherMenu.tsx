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
  getNewsRoute,
  getOpenDataRoute,
  getPlayerExportRoute,
  getRankingTiersRoute,
} from "../../../src/routes";
import React from "react";
import {
  IconActivity,
  IconBarrierBlock,
  IconChevronDown,
  IconDatabaseShare,
  IconAward,
  IconUsers,
  IconVideo,
  IconNews,
} from "@tabler/icons-react";

const OtherMenu = ({
  classes,
  close,
  t,
}: {
  classes: Record<string, string>;
  close?: () => void;
  t: (key: string) => string;
}) => {
  const mobileView = (
    <div className={classes.hiddenDesktop}>
      <Accordion chevronPosition="right">
        <Accordion.Item value="explorer_menu">
          <Accordion.Control className={classes.link}>
            <Text fw="500">{t("mainMenu.other")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Group gap={"xs"}>
                <IconAward size={16} />
                <Anchor component={Link} href={getRankingTiersRoute()} onClick={close}>
                  {t("mainMenu.otherMenu.tiers")}
                </Anchor>
              </Group>
              <Group gap={"xs"}>
                <IconDatabaseShare size={16} />
                <Anchor component={Link} href={getOpenDataRoute()} onClick={close}>
                  {t("mainMenu.otherMenu.openData")}
                </Anchor>
              </Group>
              <Group gap={"xs"}>
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
      <HoverCard width={240} position="bottom" radius="md" shadow="md">
        <HoverCard.Target>
          <div>
            <Group gap={3} className={classes.link}>
              {t("mainMenu.other")}
              <IconChevronDown size={16} />
            </Group>
          </div>
        </HoverCard.Target>
        <HoverCard.Dropdown style={{ textAlign: "left", overflow: "hidden" }}>
          <Group>
            <Group gap={"xs"}>
              <IconAward size={16} />
              <Anchor component={Link} href={getRankingTiersRoute()}>
                {t("mainMenu.otherMenu.tiers")}
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconNews size={16} />
              <Anchor component={Link} href={getNewsRoute()}>
                {t("mainMenu.otherMenu.coh3News")}
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconVideo size={16} />
              <Anchor component={Link} href={"https://cohdb.com"} target={"_blank"}>
                COHDB Replays
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconDatabaseShare size={16} />
              <Anchor component={Link} href={getOpenDataRoute()}>
                {t("mainMenu.otherMenu.openData")}
              </Anchor>
            </Group>
            <Group gap={"xs"}>
              <IconUsers size={16} />
              <Anchor component={Link} href={getPlayerExportRoute()}>
                {t("mainMenu.otherMenu.playerExport")}
              </Anchor>
            </Group>

            <Group gap={"xs"}>
              <IconActivity size={16} />
              <Anchor
                component={Link}
                href={"https://stats.uptimerobot.com/03lN1ckr5j"}
                target={"_blank"}
              >
                Relic API Status
              </Anchor>
            </Group>
            <Tooltip label="Coming Soon" color="orange" withArrow position={"bottom"}>
              <Anchor className={classes.disabledLink} component={Link} href={getOpenDataRoute()}>
                <Group gap={"xs"}>
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
