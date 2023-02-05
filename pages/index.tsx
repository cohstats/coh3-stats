import type { NextPage } from "next";
import Link from "next/link";
import { Button } from "@mantine/core";
import { NewsSection } from "../components/NewsSection/NewsSection";
import FirestoreTest from "../components/firestore-test";

const Home: NextPage = () => {
  return (
    <>
      <FirestoreTest />
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
