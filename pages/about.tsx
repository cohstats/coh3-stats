import { NextPage } from "next";
import Head from "next/head";

import { Container, Title, Tabs, Center } from "@mantine/core";
import React, { useEffect } from "react";
import { AnalyticsAboutAppPageView } from "../src/firebase/analytics";

import { generateKeywordsString } from "../src/head-utils";
import AboutUs from "../components/about/AboutUs";

const keywords = generateKeywordsString(["coh3 stats", "coh3 discord", "bug report", "github"]);

/**
 * This is example page you can find it by going on ur /example
 * @constructor
 */
const About: NextPage = () => {
  useEffect(() => {
    AnalyticsAboutAppPageView();
  }, []);

  return (
    <div>
      {/*This is custom HEAD overwrites the default one*/}
      <Head>
        <title>About COH3 Stats</title>
        <meta name="description" content="COH3 Stats - learn more about our page." />
        <meta name="keywords" content={keywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <>
        <Center>
          <Title order={1} size="h4" pt="md" mb="md">
            FAQs
          </Title>
        </Center>
        <Container size={"md"}>
          {" "}
          <Tabs defaultValue="leaderboards" orientation="vertical">
            <Tabs.List mr="md">
              <Tabs.Tab value="leaderboards">Leaderboards</Tabs.Tab>
              <Tabs.Tab value="profile">Player Profiles</Tabs.Tab>
              <Tabs.Tab value="about">About Us</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="leaderboards"></Tabs.Panel>
            <Tabs.Panel value="messages">Messages tab content</Tabs.Panel>
            <Tabs.Panel value="about">
              <AboutUs />
            </Tabs.Panel>
          </Tabs>
        </Container>
      </>
    </div>
  );
};

export default About;
