import React from "react";
import {
  Burger,
  Container,
  Group,
  Header as MantineHeader,
  Image as MantineImage,
  Title,
  Divider,
  Drawer,
  ScrollArea,
  HoverCard,
  Text,
  SimpleGrid,
  createStyles,
  Stack,
  ActionIcon,
  Tooltip,
  Anchor,
  Grid,
  Flex,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import { IconBarrierBlock, IconChevronDown } from "@tabler/icons";
import { ColorSchemeToggle } from "../other/color-scheme-toggle";
import { SearchButton } from "../search-button/search-button";
import { OnlinePlayers } from "../online-players";
import { raceType } from "../../src/coh3/coh3-types";
import { localizedNames } from "../../src/coh3/coh3-data";
import config from "../../config";

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
    [theme.fn.largerThan("md")]: {
      display: "none",
    },
  },
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,
    borderRadius: theme.radius.md,

    [theme.fn.smallerThan("sm")]: {
      height: 42,
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
      textDecoration: "none",
    }),
  },
  disabledLink: {
    color: theme.colorScheme === "dark" ? theme.colors.gray[6] : theme.colors.gray[6],
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

    [theme.fn.largerThan("md")]: {
      display: "none",
    },
  },
  hiddenDesktop: {
    [theme.fn.largerThan("md")]: {
      display: "none",
    },
  },
  hiddenMobile: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },
}));

export const Header: React.FC<HeaderProps> = () => {
  const { classes, cx } = useStyles();
  const [opened, { toggle, close }] = useDisclosure(false);

  const leaderboardFactionLink = (faction: raceType, gamemode: string) => (
    <Text>
      <Anchor component={Link} href={"/leaderboards?race=" + faction + "&type=" + gamemode}>
        {localizedNames[faction]}
      </Anchor>
    </Text>
  );

  const gamemodeLeaderboards = (gamemode: string) => (
    <div>
      <Text weight={700}>{gamemode}</Text>
      <Divider my="sm" />
      {leaderboardFactionLink("american", gamemode)}
      {leaderboardFactionLink("german", gamemode)}
      {leaderboardFactionLink("dak", gamemode)}
      {leaderboardFactionLink("british", gamemode)}
    </div>
  );
  return (
    <>
      <MantineHeader height={60} className={classes.root}>
        <Container className={classes.container} fluid>
          <Anchor component={Link} href={"/"} className={cx(classes.link)}>
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
          </Anchor>

          <Group className={classes.hiddenMobile} spacing={0}>
            <HoverCard width={800} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <div>
                  <Anchor component={Link} href="/leaderboards" className={cx(classes.link)}>
                    <Group spacing={3}>
                      Leaderboards
                      <IconChevronDown size={16} />
                    </Group>
                  </Anchor>
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
            <Tooltip label="Coming soon" color="orange">
              <Anchor
                component={Link}
                href="#"
                className={cx(classes.link, classes.disabledLink)}
              >
                Statistics{" "}
                <ActionIcon color="orange" size="sm" radius="xl" variant="transparent">
                  <IconBarrierBlock size={16} />
                </ActionIcon>
              </Anchor>
            </Tooltip>

            <Tooltip label="Coming soon" color="orange">
              <Anchor
                component={Link}
                href="#"
                className={cx(classes.link, classes.disabledLink)}
              >
                App{" "}
                <ActionIcon color="orange" size="sm" radius="xl" variant="transparent">
                  <IconBarrierBlock size={16} />
                </ActionIcon>
              </Anchor>
            </Tooltip>

            {config.isDevEnv() ? explorerOption({ cx, classes }) : <></>}

            <Anchor component={Link} href="/about" className={cx(classes.link)}>
              About{" "}
            </Anchor>
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
                <Anchor
                  component={Link}
                  href="/leaderboards"
                  className={classes.link}
                  onClick={() => close()}
                >
                  Leaderboards{" "}
                </Anchor>
                <Tooltip label="Coming soon" color="orange">
                  <Anchor
                    component={Link}
                    href="#"
                    className={cx(classes.link, classes.disabledLink)}
                    onClick={() => close()}
                  >
                    Statistics{" "}
                    <ActionIcon color="orange" size="sm" radius="xl" variant="transparent">
                      <IconBarrierBlock size={16} />
                    </ActionIcon>
                  </Anchor>
                </Tooltip>

                <Tooltip label="Coming soon" color="orange">
                  <Anchor
                    component={Link}
                    href="#"
                    className={cx(classes.link, classes.disabledLink)}
                    onClick={() => close()}
                  >
                    App{" "}
                    <ActionIcon color="orange" size="sm" radius="xl" variant="transparent">
                      <IconBarrierBlock size={16} />
                    </ActionIcon>
                  </Anchor>
                </Tooltip>

                {config.isDevEnv() ? explorerOption({ cx, classes }) : <></>}

                <Anchor
                  component={Link}
                  href="/about"
                  className={cx(classes.link)}
                  onClick={() => close()}
                >
                  About{" "}
                </Anchor>
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

/** @TODO Got lazy to replace dak for afrika_korps :D */
const explorerFactionLink = (faction: raceType) => {
  const iconFaction = faction === "dak" ? "afrika_korps" : faction;
  return (
    <Flex direction="row" align="center" gap="md">
      <MantineImage
        height={24}
        width={24}
        fit="contain"
        src={`/icons/common/races/${iconFaction}.png`}
        alt="Test text"
      />
      <Anchor color="orange" component={Link} href={`/explorer?race=${faction}`}>
        {localizedNames[faction]}
      </Anchor>
    </Flex>
  );
};

/**
 * @TODO Provide the toolName type for the routes. In the meantime, provide the
 * route fragment as string.
 */
const explorerToolLink = (toolName: string, url: string) => (
  <Text>
    <Anchor color="orange" component={Link} href={`/explorer?tool=${url}`}>
      {toolName}
    </Anchor>
  </Text>
);

const explorerOption = ({
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
          <Stack>
            <Text weight={700}>Other Stuff</Text>
            <Text>
              <Anchor color="orange" component={Link} href="#">
                Child stuff
              </Anchor>
            </Text>
          </Stack>
          <Divider my="sm" />
          <Stack>
            <Text weight={700}>Tools</Text>
            {explorerToolLink("DPS Calculator", "dps_calculator")}
          </Stack>
        </Grid.Col>
      </Grid>
    </HoverCard.Dropdown>
  </HoverCard>
);
