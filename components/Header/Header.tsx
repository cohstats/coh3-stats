import React from 'react';
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
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { IconChevronDown } from '@tabler/icons';
import useStyles from './Header.styles';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { SearchButton } from '../SearchButton/SearchButton';
import { DiscordChannel } from '../DiscordChannel/DiscordChannel';
import { Github } from '../Github/Github';
import { Donate } from '../Donate/Donate';

export interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
  const { classes } = useStyles();
  const [opened, { toggle, close }] = useDisclosure(false);

  const factionLink = (faction: string) => (
    <Text>
      <Link href="/">
        <a className={classes.subLink}>{faction}</a>
      </Link>
    </Text>
  );

  const gamemodeLeaderboards = (gamemode: string) => (
    <div>
      <Text weight={700}>{gamemode}</Text>
      <Divider my="sm" />
      {factionLink('OST')}
      {factionLink('DAK')}
      {factionLink('USF')}
      {factionLink('UKF')}
    </div>
  );
  return (
    <>
      <MantineHeader height={60} className={classes.root}>
        <Container className={classes.container} fluid>
          <Group spacing="xs">
            <Image src="/logo/android-icon-36x36.png" width={30} height={30} />
            <Title order={1} size="h3">
              COH3 Stats
            </Title>
          </Group>

          <Group className={classes.hiddenMobile}>
            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <div>
                  <Link href="/">
                    <a className={classes.link}>
                      <Group spacing={3}>
                        Leaderboard
                        <IconChevronDown size={16} />
                      </Group>
                    </a>
                  </Link>
                </div>
              </HoverCard.Target>
              <HoverCard.Dropdown sx={{ overflow: 'hidden' }}>
                <SimpleGrid cols={4} spacing={0}>
                  {gamemodeLeaderboards('1v1')}
                  {gamemodeLeaderboards('2v2')}
                  {gamemodeLeaderboards('3v3')}
                  {gamemodeLeaderboards('4v4')}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>

            <Link href="/">
              <a className={classes.link}>Statistics</a>
            </Link>
            <Link href="/">
              <a className={classes.link}>App</a>
            </Link>
            {children}
          </Group>

          <Group spacing={5} className={classes.hiddenMobile}>
            <SearchButton />
            <DiscordChannel />
            <Github />
            <Donate />
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
            <ScrollArea sx={{ height: 'calc(100vh - 60px)' }} mx="-md">
              <Divider my="sm" />
              {children}
              <Divider my="sm" />

              <Group>
                <SearchButton />
                <DiscordChannel />
                <Github />
                <Donate />
                <ColorSchemeToggle />
              </Group>
            </ScrollArea>
          </Drawer>
        </Container>
      </MantineHeader>
    </>
  );
};
