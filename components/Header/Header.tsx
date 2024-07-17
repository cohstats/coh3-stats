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
//import { createStyles } from '@mantine/emotion';
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
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
  getNewsRoute,
} from "../../src/routes";
import StatisticsMenu from "./components/StatisticsMenu";
import OtherMenu from "./components/OtherMenu";
import config from "../../config";

import classes from "./Header.module.css";


export interface HeaderProps {
  // children?: React.ReactNode;
}

// const useStyles = createStyles((theme) => ({
//   root: {
//     // marginBottom: theme.spacing.xl,
//   },
//   container: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     height: "100%",
//   },
//   burger: {
//     [theme.fn.largerThan("md")]: {
//       display: "none",
//     },
//   },
//   link: {
//     display: "flex",
//     alignItems: "center",
//     height: "100%",
//     paddingLeft: theme.spacing.md,
//     paddingRight: theme.spacing.md,
//     paddingTop: theme.spacing.xs,
//     paddingBottom: theme.spacing.xs,
//     textDecoration: "none",
//     color: theme.colorScheme === "dark" ? theme.white : theme.black,
//     fontWeight: 500,
//     fontSize: theme.fontSizes.sm,
//     borderRadius: theme.radius.md,
//
//     [theme.fn.smallerThan("sm")]: {
//       height: 42,
//       display: "flex",
//       alignItems: "center",
//       width: "100%",
//     },
//
//     ...theme.fn.hover({
//       backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
//       textDecoration: "none",
//     }),
//   },
//   disabledLink: {
//     color: theme.colors.gray[6],
//   },
//   subLink: {
//     width: "100%",
//     textDecoration: "none",
//     color: theme.colorScheme === "dark" ? theme.white : theme.black,
//     borderRadius: theme.radius.md,
//
//     ...theme.fn.hover({
//       backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
//     }),
//
//     "&:active": theme.activeStyles,
//   },
//   dropdown: {
//     position: "absolute",
//     top: 60,
//     left: 0,
//     right: 0,
//     zIndex: 0,
//     borderTopRightRadius: 0,
//     borderTopLeftRadius: 0,
//     borderTopWidth: 0,
//     overflow: "hidden",
//
//     [theme.fn.largerThan("md")]: {
//       display: "none",
//     },
//   },
//   hiddenDesktop: {
//     [theme.fn.largerThan("md")]: {
//       display: "none",
//     },
//   },
//   hiddenMobile: {
//     [theme.fn.smallerThan("md")]: {
//       display: "none",
//     },
//   },
// }));

export const Header: React.FC<HeaderProps> = () => {
  // const { classes, cx } = useStyles();

  const [opened, { toggle, close }] = useDisclosure(false);
  const isMediumScreen = useMediaQuery("(min-width: 64em) and (max-width: 90em)");

  const MobileView = (
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

            <Anchor
              component={Link}
              href={getDesktopAppRoute()}
              className={classes.link}
              onClick={() => close()}
            >
              Desktop App
            </Anchor>

            <ExplorerMenu  close={close} classes={classes} />

            <Anchor
              component={Link}
              href={getNewsRoute()}
              className={classes.link}
              onClick={() => close()}
            >
              COH3 News{" "}
            </Anchor>

            <OtherMenu  close={close} classes={classes} />

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

  return (
    <>
      <header
        className={classes.root}
        style={{ position: "sticky", zIndex: 999, height: isMediumScreen ? 100 : 60}}
      >
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

          <Group className={classes.hiddenMobile} gap={0}>
            <HoverCard width={800} position="bottom" radius="md" shadow="md">
              <HoverCard.Target>
                <div>
                  <Anchor
                    component={Link}
                    href={getLeaderBoardRoute()}
                    className={classes.link}
                  >
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
            <StatisticsMenu  classes={classes} close={close} />

            <Anchor component={Link} href={getDesktopAppRoute()} className={classes.link}>
              Desktop App
            </Anchor>

            <ExplorerMenu  close={close} classes={classes} />
            <OtherMenu  close={close} classes={classes} />
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
          {MobileView}
        </Container>
      </header>
    </>
  );
};
