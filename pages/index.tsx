import type { NextPage } from "next";
// import Link from "next/link";
// import { Button } from "@mantine/core";
import { NewsSection } from "../components/news-section/news-section";
import { Container, Image, Paper, Title, Text, Group } from "@mantine/core";
import { Github } from "../components/icon/github";
import { Donate } from "../components/icon/donate";
import { Discord } from "../components/icon/discord";

const Home: NextPage = () => {
  return (
    <Container size={"lg"}>
      <Image src="/coming-soon/coh3-background.jpg" radius="md" height={400} />
      <Paper shadow="xs" radius="md" mt="md" p="lg" color="gray">
        <Title order={1}>Company of Heroes 3 is out🎉</Title>
        <Title order={2} size="h4" pt="md">
          We have a lot to do. Help us build this site
        </Title>
        <Text pt="sm">More info on Github or Discord</Text>
        <Group pt="md">
          <Discord />
          <Github />
          <Donate />
        </Group>
      </Paper>
    </Container>
  );
};

export default Home;
