import React from "react";
import {
  Burger,
  Container,
  Group,
  Title,
  Divider,
  Drawer,
  ScrollArea,
  HoverCard,
  Stack,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import { ColorSchemeToggle } from "../other/color-scheme-toggle";
import { SearchButton } from "./components/search-button";
import { OnlinePlayers } from "../online-players";
import ExplorerMenu from "./components/ExplorerMenu";
import LeaderboardsMenu from "./components/LeaderboardsMenu";
import {
  getAboutRoute,
  getDesktopAppRoute,
  getLeaderBoardRoute,
  getLiveGamesRoute,
  getNewsRoute,
} from "../../src/routes";
import StatisticsMenu from "./components/StatisticsMenu";
import OtherMenu from "./components/OtherMenu";
import config from "../../config";

import classes from "./Header.module.css";

export interface HeaderProps {
  // children?: React.ReactNode;
}

const MobileView = () => {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <>
      <Burger
        opened={opened}
        onClick={toggle}
        className={classes.burger}
        size="sm"
        aria-label="Toggle menu"
      />
      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea style={{ height: "calc(100vh - 60px)" }} mx="-md">
          <Divider my="sm" />
          <Stack px="md">
            <Group grow>
              <SearchButton redirectOnClick={true} close={close} />
            </Group>
            <Anchor
              component={Link}
              href={getLeaderBoardRoute()}
              className={classes.link}
              onClick={() => close()}
            >
              Leaderboards
            </Anchor>

            <StatisticsMenu classes={classes} close={close} />

            <ExplorerMenu close={close} classes={classes} />

            <Anchor
              component={Link}
              href={getLiveGamesRoute()}
              className={classes.link}
              onClick={() => close()}
            >
              Live Games
            </Anchor>

            <Anchor
              component={Link}
              href={getNewsRoute()}
              className={classes.link}
              onClick={() => close()}
            >
              COH3 News{" "}
            </Anchor>

            <Anchor
              component={Link}
              href={getDesktopAppRoute()}
              className={classes.link}
              onClick={() => close()}
            >
              Desktop App
            </Anchor>

            <OtherMenu close={close} classes={classes} />

            <Anchor
              component={Link}
              href={getAboutRoute()}
              className={classes.link}
              onClick={() => close()}
            >
              About{" "}
            </Anchor>

            <Anchor component={Link} href={config.DONATION_LINK} className={classes.link}>
              <Image
                src="/kofi_s_logo_nolabel.webp"
                width={22}
                height={22}
                alt={"donate button"}
                unoptimized
                style={{ marginRight: "5px" }}
              />
              Support Us
            </Anchor>
          </Stack>

          <Divider my="sm" />

          <Group px="md">
            <ColorSchemeToggle onClick={() => close()} />
          </Group>
        </ScrollArea>
      </Drawer>
    </>
  );
};

const DesktopView = () => {
  return (
    <>
      <Group className={classes.hiddenMobile} gap={0}>
        <HoverCard width={800} position="bottom" radius="md" shadow="md">
          <HoverCard.Target>
            <div>
              <Anchor component={Link} href={getLeaderBoardRoute()} className={classes.link}>
                <Group gap={3}>
                  Leaderboards
                  <IconChevronDown size={16} />
                </Group>
              </Anchor>
            </div>
          </HoverCard.Target>
          <HoverCard.Dropdown style={{ overflow: "hidden" }}>
            <LeaderboardsMenu />
          </HoverCard.Dropdown>
        </HoverCard>
        <StatisticsMenu classes={classes} />
        <ExplorerMenu classes={classes} />
        <Anchor component={Link} href={getLiveGamesRoute()} className={classes.link}>
          Live Games
        </Anchor>
        <Anchor component={Link} href={getDesktopAppRoute()} className={classes.link}>
          Desktop App
        </Anchor>
        <OtherMenu classes={classes} />
        <Anchor component={Link} href={getAboutRoute()} className={classes.link}>
          About
        </Anchor>
        <Anchor component={Link} href={config.DONATION_LINK} className={classes.link}>
          <Image
            src="/kofi_s_logo_nolabel.webp"
            width={22}
            height={22}
            alt={"donate button"}
            unoptimized
            style={{ marginRight: "5px" }}
          />
          Support Us
        </Anchor>
      </Group>

      <Group gap={5} className={classes.hiddenMobile}>
        <OnlinePlayers />
        <SearchButton />
        <ColorSchemeToggle />
      </Group>
    </>
  );
};

export const Header: React.FC<HeaderProps> = () => {
  return (
    <>
      <header className={classes.headerRoot}>
        <Container className={classes.container} fluid>
          <Anchor component={Link} href={"/"} className={classes.link}>
            <Group gap="xs">
              <Image
                src="/logo/android-icon-48x48.png"
                width={30}
                height={30}
                alt={"COH3 Stats logo"}
                unoptimized
              />

              <Title order={1} size="h3">
                COH3 Stats
              </Title>
            </Group>
          </Anchor>
          <DesktopView />
          <MobileView />
        </Container>
      </header>
    </>
  );
};
