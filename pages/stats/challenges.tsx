import { NextPage } from "next";
import Head from "next/head";
import {
  Accordion,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { getMappings } from "../../src/unitStats/mappings";
import { generateKeywordsString } from "../../src/head-utils";
import { ChallengesType, SbpsType } from "../../src/unitStats";
import { IconMedal } from "@tabler/icons-react";

interface ChallengesProps {
  dailyChallengesData: ChallengesType[];
  weeklyChallengesData: ChallengesType[];
  sbpsData: SbpsType[];
}

const Challenges: NextPage<ChallengesProps> = ({
  dailyChallengesData,
  weeklyChallengesData,
  sbpsData,
}) => {
  const keywords = generateKeywordsString(["coh3 challenges", "challenges"]);

  // console.log("Daily Challenges fetched", dailyChallengesData);

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
                      <AccordionContent sbpsData={sbpsData} challenge={row} />
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
                      <AccordionContent sbpsData={sbpsData} challenge={row} />
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
  challenge: ChallengesType;
}

function AccordionContent({ challenge, sbpsData }: AccordionContentProps) {
  const counters = challenge.counters;
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
      <Title order={5} color="red.5">
        Counters
      </Title>
      {counters.research.length ? (
        <List spacing="sm">
          {...counters.research.map((id) => {
            return <List.Item key={id}>{id}</List.Item>;
          })}
        </List>
      ) : (
        <></>
      )}
      {counters.spawnee.length ? (
        <List spacing="sm">
          {...counters.spawnee.map((id) => {
            return <List.Item key={id}>{id}</List.Item>;
          })}
        </List>
      ) : (
        <></>
      )}
      {mappedSources.length ? (
        <List spacing="sm">
          {...mappedSources.map((item) => (
            <List.Item key={item.id}>{item.squad?.ui.screenName || "---"}</List.Item>
          ))}
        </List>
      ) : (
        <></>
      )}
      {mappedTargets.length ? (
        <List spacing="sm">
          {...mappedTargets.map((item) => (
            <List.Item key={item.id}>{item.squad?.ui.screenName || "---"}</List.Item>
          ))}
        </List>
      ) : (
        <></>
      )}
    </Stack>
  );
}

export const getStaticProps = async () => {
  const { dailyChallengesData, weeklyChallengesData, sbpsData } = await getMappings();

  return {
    props: {
      dailyChallengesData,
      weeklyChallengesData,
      sbpsData,
    },
  };
};

export default Challenges;
