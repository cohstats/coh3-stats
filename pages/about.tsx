import { NextPage } from "next";
import Head from "next/head";

import { Container } from "@mantine/core";

/**
 * This is example page you can find it by going on ur /example
 * @constructor
 */
const About: NextPage = () => {
  return (
    <div>
      {/*This is custom HEAD overwrites the default one*/}
      <Head>
        <title>About COH3 Stats</title>
        <meta name="description" content="COH3 Stats - learn more about our page." />
      </Head>
      <>
        <Container size={"lg"}>About the page</Container>
      </>
    </div>
  );
};

export default About;
