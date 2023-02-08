import type { NextPage } from "next";
// import Link from "next/link";
// import { Button } from "@mantine/core";
import { NewsSection } from "../components/news-section/news-section";

const Home: NextPage = () => {
  return (
    <>
      {/*<Link href="/hello" passHref legacyBehavior>*/}
      {/*  <Button component="a">Next link button</Button>*/}
      {/*</Link>*/}
      <NewsSection />
      <NewsSection />
      <NewsSection />
    </>
  );
};

export default Home;
