import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Container, Flex, Image, Stack, Text, Title } from "@mantine/core";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { raceType } from "../../../src/coh3/coh3-types";

const RaceDetail: NextPage = () => {
  // The `query` contains the `raceId`, which is the filename as route slug.
  const { query } = useRouter();
  console.log("🚀 ~ file: [raceId].tsx:11 ~ query:", query);

  const raceToFetch: raceType = (query.raceId as raceType) || "american";
  const localizedRace = localizedNames[raceToFetch];
  const iconFaction = raceToFetch === "dak" ? "afrika_korps" : raceToFetch;

  return (
    <>
      <Head>
        <title>{localizedRace} - COH3 Explorer</title>
        <meta name="description" content={`${localizedRace} - COH3 Explorer`} />
      </Head>
      <Container size="md">
        <Stack>
          <Flex direction="row" align="center" gap="md">
            <Image
              height={64}
              width={64}
              fit="contain"
              src={`/icons/common/races/${iconFaction}.png`}
              alt={localizedRace}
            />
            <Title order={2}>{localizedRace}</Title>
          </Flex>

          <Text size="lg">Provide the civ description here.</Text>
        </Stack>

        {/* Buildings Section */}
        <Stack>
          <Title order={4}>Buildings</Title>
        </Stack>
      </Container>
    </>
  );
};

export default RaceDetail;
