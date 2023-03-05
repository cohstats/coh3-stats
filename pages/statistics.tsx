import { NextPage } from "next";
import Head from "next/head";

import { Container, Title, Group, Anchor, Flex } from "@mantine/core";
import { localizedNames } from "../src/coh3/coh3-data";
import FactionIcon from "../components/faction-icon";
import Link from "next/link";

const Explorer: NextPage = () => {
  const factions = Object.keys(localizedNames) as Array<keyof typeof localizedNames>;

  return (
    <div>
      <Head>
        <title>Explorer</title>
        <meta name="description" content="COH3 Stats - learn more about our page." />
      </Head>
      <>
        <Container size={"md"}>
          <Title order={1} size="h4" pt="md">
            Statistics
          </Title>
          <Group>
            {factions.map((link) => (
              <Anchor key={link} component={Link} href={`/statistics/${link}`}>
                <Flex>
                  <FactionIcon name={link} width={40} />
                  <Group spacing="xs">{localizedNames[link]}</Group>
                </Flex>
              </Anchor>
            ))}
          </Group>
        </Container>
      </>
    </div>
  );
};

export default Explorer;
