import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { Accordion, Card, Container, Flex, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { getMappings } from "../../src/unitStats/mappings";
import { generateKeywordsString } from "../../src/head-utils";
import { ChallengesType, SbpsType, UpgradesType } from "../../src/unitStats";
import { IconMedal } from "@tabler/icons-react";
import ImageWithFallback, { iconPlaceholder } from "../../components/placeholders";
import { useEffect } from "react";
import { AnalyticsExplorerChallengesView } from "../../src/firebase/analytics";

interface ResolvedChallenge {
  challenge: Pick<ChallengesType, "name" | "id" | "reward" | "description">;
  research: Array<{ id: string; upgrade: UpgradesType | null }>;
  spawnee: Array<{ id: string; squad: SbpsType | null }>;
  sources: Array<{ id: string; squad: SbpsType | null }>;
  targets: Array<{ id: string; squad: SbpsType | null }>;
}

interface ChallengesProps {
  calculatedData: {
    dailyChallenges: ResolvedChallenge[];
    weeklyChallenges: ResolvedChallenge[];
  };
}
const keywords = generateKeywordsString(["coh3 challenges", "challenges"]);

const Challenges: NextPage<ChallengesProps> = ({ calculatedData }) => {
  useEffect(() => {
    AnalyticsExplorerChallengesView();
  }, []);

  // console.log("Daily Challenges fetched", dailyChallengesData);
  // console.log("Weekly Challenges fetched", weeklyChallengesData);

  const { dailyChallenges, weeklyChallenges } = calculatedData;

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
          {weeklyChallenges.map(({ challenge, research, spawnee, sources, targets }) => {
            return (
              <Grid.Col key={challenge.id} span={1}>
                <Accordion p={0} chevronPosition="right" variant="separated">
                  <Accordion.Item value={challenge.id} key={challenge.name}>
                    <Accordion.Control>
                      <AccordionLabel {...challenge} />
                    </Accordion.Control>
                    <Accordion.Panel>
                      <AccordionContent
                        key={`weekly_${challenge.id}`}
                        challenge={challenge}
                        research={research}
                        spawnee={spawnee}
                        sources={sources}
                        targets={targets}
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
          {dailyChallenges.map(({ challenge, research, spawnee, sources, targets }) => {
            return (
              <Grid.Col key={challenge.id} span={1}>
                <Accordion p={0} chevronPosition="right" variant="separated">
                  <Accordion.Item value={challenge.id} key={challenge.name}>
                    <Accordion.Control>
                      <AccordionLabel {...challenge} />
                    </Accordion.Control>
                    <Accordion.Panel>
                      <AccordionContent
                        key={`daily_${challenge.id}`}
                        challenge={challenge}
                        research={research}
                        spawnee={spawnee}
                        sources={sources}
                        targets={targets}
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

function AccordionLabel({ name, description, reward }: ResolvedChallenge["challenge"]) {
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

function AccordionContent({ spawnee, research, targets, sources }: ResolvedChallenge) {
  return (
    <Stack>
      {research.length ? (
        <Stack>
          <Title order={5} color="blue.5">
            Requires these upgrades
          </Title>

          <Group key="required_upg" spacing="sm" position="apart">
            {...research.map((item, idx) => {
              return (
                <Stack align="center" w={128} key={`${item.id}_${idx}`}>
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
      {spawnee.length ? (
        <Stack>
          <Title order={5} color="orange.5">
            Requires training these units
          </Title>

          <Group key="required_spawnee" spacing="sm" position="apart">
            {...spawnee.map((item, idx) => {
              return (
                <Stack align="center" w={128} key={`${item.id}_${idx}`}>
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
      {sources.length ? (
        <Stack>
          <Title order={5} color="green.5">
            Requires using these units
          </Title>

          <Group key="required_sources" spacing="sm" position="apart">
            {...sources.map((item, idx) => {
              return (
                <Stack align="center" w={128} key={`${item.id}_${idx}`}>
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
      {targets.length ? (
        <Stack>
          <Title order={5} color="red.5">
            Requires destroying these units
          </Title>

          <Group key="required_targets" spacing="sm" position="apart">
            {...targets.map((item, idx) => {
              return (
                <Stack align="center" w={128} key={`${item.id}_${idx}`}>
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

const createCalculateValuesForChallenges = (data: {
  dailyChallengesData: ChallengesType[];
  weeklyChallengesData: ChallengesType[];
  sbpsData: SbpsType[];
  upgradesData: UpgradesType[];
}): ChallengesProps["calculatedData"] => {
  const { dailyChallengesData, weeklyChallengesData, sbpsData, upgradesData } = data;

  const dailyChallenges: ResolvedChallenge[] = [];
  const weeklyChallenges: ResolvedChallenge[] = [];

  for (const daily of dailyChallengesData) {
    const counters = daily.counters;
    const mappedDaily: ResolvedChallenge = {
      challenge: {
        id: daily.id,
        name: daily.name,
        reward: daily.reward,
        description: daily.description,
      },
      research: counters.research.map((id) => ({
        id,
        upgrade: upgradesData.find((x) => x.id === id) || null,
      })),
      spawnee: counters.spawnee.map((id) => ({
        id,
        squad: sbpsData.find((x) => x.id === id) || null,
      })),
      sources: counters.sources.map((id) => ({
        id,
        squad: sbpsData.find((x) => x.id === id) || null,
      })),
      targets: counters.targets.map((id) => ({
        id,
        squad: sbpsData.find((x) => x.id === id) || null,
      })),
    };

    dailyChallenges.push(mappedDaily);
  }

  for (const weekly of weeklyChallengesData) {
    const counters = weekly.counters;
    const mappedWeekly: ResolvedChallenge = {
      challenge: {
        id: weekly.id,
        name: weekly.name,
        reward: weekly.reward,
        description: weekly.description,
      },
      research: counters.research.map((id) => ({
        id,
        upgrade: upgradesData.find((x) => x.id === id) || null,
      })),
      spawnee: counters.spawnee.map((id) => ({
        id,
        squad: sbpsData.find((x) => x.id === id) || null,
      })),
      sources: counters.sources.map((id) => ({
        id,
        squad: sbpsData.find((x) => x.id === id) || null,
      })),
      targets: counters.targets.map((id) => ({
        id,
        squad: sbpsData.find((x) => x.id === id) || null,
      })),
    };

    weeklyChallenges.push(mappedWeekly);
  }

  return {
    dailyChallenges,
    weeklyChallenges,
  };
};

export const getStaticProps: GetStaticProps = async () => {
  const { dailyChallengesData, weeklyChallengesData, sbpsData, upgradesData } =
    await getMappings();

  return {
    props: {
      calculatedData: createCalculateValuesForChallenges({
        dailyChallengesData,
        weeklyChallengesData,
        sbpsData,
        upgradesData,
      }),
    },
  };
};

export default Challenges;
