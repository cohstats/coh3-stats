import { NextPage } from "next";
import Head from "next/head";
import { Accordion, Card, Container, Flex, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { getMappings } from "../../src/unitStats/mappings";
import { generateKeywordsString } from "../../src/head-utils";
import { ChallengesType, SbpsType, UpgradesType } from "../../src/unitStats";
import { IconMedal } from "@tabler/icons-react";
import ImageWithFallback, { iconPlaceholder } from "../../components/placeholders";

interface ChallengesProps {
  dailyChallengesData: ChallengesType[];
  weeklyChallengesData: ChallengesType[];
  sbpsData: SbpsType[];
  upgradesData: UpgradesType[];
}

const Challenges: NextPage<ChallengesProps> = ({
  dailyChallengesData,
  weeklyChallengesData,
  sbpsData,
  upgradesData,
}) => {
  const keywords = generateKeywordsString(["coh3 challenges", "challenges"]);

  // console.log("Daily Challenges fetched", dailyChallengesData);
  // console.log("Weekly Challenges fetched", weeklyChallengesData);

  return (
    <>
      <Head>
        <title>COH3 Stats - Challenges</title>
        <meta
          name="description"
          content={
            "CoH 3 Challenges. Browser through all the challenges and checkout requirements for completion."
          }
        />
        <meta name="keywords" content={keywords} />
        {/*<meta property="og:image" content={"We might prepare a nice image for a preview for this page"} />*/}
      </Head>
      <Container size={"md"}>
        <Flex justify="space-between" align={"center"} my={16}>
          <Title order={2}>Weekly Challenges</Title>
        </Flex>
        <Grid columns={1}>
          {weeklyChallengesData.map((row) => {
            return (
              <Grid.Col key={row.id} span={1}>
                <Accordion p={0} chevronPosition="right" variant="separated">
                  <Accordion.Item value={row.id} key={row.name}>
                    <Accordion.Control>
                      <AccordionLabel {...row} />
                    </Accordion.Control>
                    <Accordion.Panel>
                      <AccordionContent
                        key={`weekly_${row.id}`}
                        sbpsData={sbpsData}
                        upgradesData={upgradesData}
                        challenge={row}
                      />
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Grid.Col>
            );
          })}
        </Grid>

        <Flex justify="space-between" align={"center"} my={16}>
          <Title order={2}>Daily Challenges</Title>
        </Flex>
        <Grid columns={1}>
          {dailyChallengesData.map((row) => {
            return (
              <Grid.Col key={row.id} span={1}>
                <Accordion p={0} chevronPosition="right" variant="separated">
                  <Accordion.Item value={row.id} key={row.name}>
                    <Accordion.Control>
                      <AccordionLabel {...row} />
                    </Accordion.Control>
                    <Accordion.Panel>
                      <AccordionContent
                        key={`daily_${row.id}`}
                        sbpsData={sbpsData}
                        upgradesData={upgradesData}
                        challenge={row}
                      />
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Grid.Col>
            );
          })}
        </Grid>
      </Container>
    </>
  );
};

function AccordionLabel({ name, description, reward }: ChallengesType) {
  return (
    <Card p="lg" radius="md" withBorder>
      <Flex direction="column" gap={4}>
        <Title order={3} color="orange.5">
          {name}
        </Title>
        <Text size="md">{description}</Text>
        <Group spacing={"xs"}>
          <IconMedal size={16} />
          <Text size="sm" color="blue.4">
            {reward} Merits
          </Text>
        </Group>
      </Flex>
    </Card>
  );
}

interface AccordionContentProps {
  sbpsData: SbpsType[];
  upgradesData: UpgradesType[];
  challenge: ChallengesType;
}

function AccordionContent({ challenge, sbpsData, upgradesData }: AccordionContentProps) {
  const counters = challenge.counters;
  const mappedResearch = counters.research.map((id) => ({
    id,
    upgrade: upgradesData.find((x) => x.id === id),
  }));
  const mappedSpawnee = counters.spawnee.map((id) => ({
    id,
    squad: sbpsData.find((x) => x.id === id),
  }));
  const mappedSources = counters.sources.map((id) => ({
    id,
    squad: sbpsData.find((x) => x.id === id),
  }));
  const mappedTargets = counters.targets.map((id) => ({
    id,
    squad: sbpsData.find((x) => x.id === id),
  }));
  return (
    <Stack>
      {mappedResearch.length ? (
        <Stack>
          <Title order={5} color="blue.5">
            Requires these upgrades
          </Title>

          <Group key="required_upg" spacing="sm" position="apart">
            {...mappedResearch.map((item) => {
              return (
                <Stack align="center" w={128}>
                  <ImageWithFallback
                    height={64}
                    width={64}
                    src={`/icons/${item.upgrade?.ui.iconName}.png`}
                    fallbackSrc={iconPlaceholder}
                    alt={item.upgrade?.ui.screenName || item.id}
                  ></ImageWithFallback>
                  <Text color="yellow.5" align="center">
                    {item.upgrade?.ui.screenName || item.id}
                  </Text>
                </Stack>
              );
            })}
          </Group>
        </Stack>
      ) : (
        <></>
      )}
      {mappedSpawnee.length ? (
        <Stack>
          <Title order={5} color="orange.5">
            Requires training these units
          </Title>

          <Group key="required_spawnee" spacing="sm" position="apart">
            {...mappedSpawnee.map((item) => {
              return (
                <Stack align="center" w={128}>
                  <ImageWithFallback
                    height={64}
                    width={64}
                    src={`/icons/${item.squad?.ui.iconName}.png`}
                    fallbackSrc={iconPlaceholder}
                    alt={item.squad?.ui.screenName || item.id}
                  ></ImageWithFallback>
                  <Text color="yellow.5" align="center">
                    {item.squad?.ui.screenName || item.id}
                  </Text>
                </Stack>
              );
            })}
          </Group>
        </Stack>
      ) : (
        <></>
      )}
      {mappedSources.length ? (
        <Stack>
          <Title order={5} color="green.5">
            Requires using these units
          </Title>

          <Group key="required_sources" spacing="sm" position="apart">
            {...mappedSources.map((item) => {
              return (
                <Stack align="center" w={128}>
                  <ImageWithFallback
                    height={64}
                    width={64}
                    src={`/icons/${item.squad?.ui.iconName}.png`}
                    fallbackSrc={iconPlaceholder}
                    alt={item.squad?.ui.screenName || item.id}
                  ></ImageWithFallback>
                  <Text color="yellow.5" align="center">
                    {item.squad?.ui.screenName || item.id}
                  </Text>
                </Stack>
              );
            })}
          </Group>
        </Stack>
      ) : (
        <></>
      )}
      {mappedTargets.length ? (
        <Stack>
          <Title order={5} color="red.5">
            Requires destroying these units
          </Title>

          <Group key="required_targets" spacing="sm" position="apart">
            {...mappedTargets.map((item) => {
              return (
                <Stack align="center" w={128}>
                  <ImageWithFallback
                    height={64}
                    width={64}
                    src={`/icons/${item.squad?.ui.iconName}.png`}
                    fallbackSrc={iconPlaceholder}
                    alt={item.squad?.ui.screenName || item.id}
                  ></ImageWithFallback>
                  <Text color="yellow.5" align="center">
                    {item.squad?.ui.screenName || item.id}
                  </Text>
                </Stack>
              );
            })}
          </Group>
        </Stack>
      ) : (
        <></>
      )}
    </Stack>
  );
}

export const getStaticProps = async () => {
  const { dailyChallengesData, weeklyChallengesData, sbpsData, upgradesData } =
    await getMappings();

  return {
    props: {
      dailyChallengesData,
      weeklyChallengesData,
      sbpsData,
      upgradesData,
    },
  };
};

export default Challenges;
