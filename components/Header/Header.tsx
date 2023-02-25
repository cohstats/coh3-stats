import React from "react";
import {
  Burger,
  Container,
  Group,
  Header as MantineHeader,
  Title,
  Divider,
  Drawer,
  ScrollArea,
  HoverCard,
  Text,
  SimpleGrid,
  createStyles,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons";
import { ColorSchemeToggle } from "../color-scheme-toggle";
import { SearchButton } from "../search-button/search-button";
import { OnlinePlayers } from "../online-players";

export interface HeaderProps {
  // children?: React.ReactNode;
}

const useStyles = createStyles((theme) => ({
  root: {
    marginBottom: theme.spacing.xl,
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },
  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: 42,
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
    }),
  },
  subLink: {
    width: "100%",
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },
  dropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },
}));

export const Header: React.FC<HeaderProps> = () => {
  const { classes } = useStyles();
  const [opened, { toggle, close }] = useDisclosure(false);

  const factionLink = (faction: string) => (
    <Text>
      <Link href="/">{faction}</Link>
    </Text>
  );

  const gamemodeLeaderboards = (gamemode: string) => (
    <div>
      <Text weight={700}>{gamemode}</Text>
      <Divider my="sm" />
      {factionLink("Wehrmacht")}
      {factionLink("Deutsche Afrikakorps")}
      {factionLink("US Forces")}
      {factionLink("British Forces")}
    </div>
  );
  return (
    <>
      <MantineHeader height={60} className={classes.root}>
        <Container className={classes.container} fluid>
          <Group spacing="xs">
            <Image
              src="/logo/android-icon-36x36.png"
              width={30}
              height={30}
              alt={"COH3 Stats logo"}
            />
            <Title order={1} size="h3">
              COH3 Stats
            </Title>
          </Group>

          <Group className={classes.hiddenMobile}>
            <HoverCard width={800} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <div>
                  <Link href="/">
                    <Group spacing={3}>
                      Leaderboards
                      <IconChevronDown size={16} />
                    </Group>
                  </Link>
                </div>
              </HoverCard.Target>
              <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
                <SimpleGrid cols={4} spacing={0}>
                  {gamemodeLeaderboards("1v1")}
                  {gamemodeLeaderboards("2v2")}
                  {gamemodeLeaderboards("3v3")}
                  {gamemodeLeaderboards("4v4")}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>

            <Link href="/">Statistics</Link>
            <Link href="/">
              {/*<a className={classes.link}>App</a>*/}
              App
            </Link>
          </Group>

          <Group spacing={5} className={classes.hiddenMobile}>
            <OnlinePlayers />
            <SearchButton />
            <ColorSchemeToggle />
          </Group>
          <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />
          <Drawer
            opened={opened}
            onClose={close}
            size="100%"
            padding="md"
            title="Navigation"
            className={classes.hiddenDesktop}
            zIndex={1000000}
          >
            <ScrollArea sx={{ height: "calc(100vh - 60px)" }} mx="-md">
              <Divider my="sm" />
              <Stack px="md">
                <Group grow>
                  <SearchButton onClick={() => close()} />
                </Group>
                <Link href="/" onClick={() => close()}>
                  Leaderboards
                </Link>
                <Link href="/" onClick={() => close()}>
                  Statistics
                </Link>
                <Link href="/" onClick={() => close()}>
                  App
                </Link>
              </Stack>

              <Divider my="sm" />

              <Group px="md">
                <ColorSchemeToggle onClick={() => close()} />
              </Group>
            </ScrollArea>
          </Drawer>
        </Container>
      </MantineHeader>
    </>
  );
};
