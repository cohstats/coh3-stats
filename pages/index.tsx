import type { NextPage } from "next";
// import Link from "next/link";
// import { Button } from "@mantine/core";
import { NewsSection } from "../components/news-section/news-section";
import { Container } from "@mantine/core";

const Home: NextPage = () => {
  return (
    <Container size={"lg"}>
      {/*<Link href="/hello" passHref legacyBehavior>*/}
      {/*  <Button component="a">Next link button</Button>*/}
      {/*</Link>*/}
      <NewsSection />
      <NewsSection />
      <NewsSection />
    </Container>
  );
};

export default Home;
