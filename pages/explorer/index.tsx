import Head from "next/head";
import { NextPage } from "next";
import { Anchor, Card, Container, Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";
import { raceType } from "../../src/coh3/coh3-types";
import { localizedNames } from "../../src/coh3/coh3-data";
import FactionIcon from "../../components/faction-icon";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import { getExplorerFactionRoute } from "../../src/routes";

const Races: raceType[] = ["german", "american", "dak", "british"];

/** @TODO Got lazy to replace dak for afrika_korps :D */
const explorerFactionLink = (faction: raceType) => {
  return (
    <Flex direction="row" justify="space-between" align="center">
      <Flex direction="row" align="center" gap="md">
        <FactionIcon name={faction} width={64} />
        <Text weight="bold">{localizedNames[faction]}</Text>
      </Flex>
      <IconChevronRight size={16} />
    </Flex>
  );
};

const Explorer: NextPage = () => {
  return (
    <>
      <Head>
        <title>COH3 Explorer</title>
        <meta name="description" content="COH3 Factions Explorer." />
        <meta
          name="keywords"
          content="COh3, Wehrmacht, US Forces, DAK, Deutsches Afrikakorps, British Forces, units, damage, buildings, costs, man power, fuel, munition"
        />
      </Head>
      <Container size="md">
        <Stack mb={24}>
          <Title order={2}>Company of Heroes 3 Factions Explorer</Title>
          <Text size="lg" mt={4}>
            Discover all units, buildings and more in the game.
          </Text>
          <Text size="md" mt={16}>
            Please provide feedback on the Discord for this section. Thank you.
          </Text>
        </Stack>

        <Stack>
          <Title order={4}>Factions</Title>
          <SimpleGrid cols={2}>
            {Races.map((faction: raceType) => {
              return (
                <Anchor
                  key={`explorer_${faction}`}
                  color="undefined"
                  underline={false}
                  component={LinkWithOutPrefetch}
                  href={getExplorerFactionRoute(faction)}
                >
                  <Card p="sm" radius="md" withBorder>
                    {explorerFactionLink(faction)}
                  </Card>
                </Anchor>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Container>
    </>
  );
};

export default Explorer;
