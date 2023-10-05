import { NextPage } from "next";
import Head from "next/head";

import {
  Container,
  Title,
  Tabs,
  Center,
  Anchor,
  Grid,
  Flex,
  Divider,
  createStyles,
} from "@mantine/core";
import React, { useEffect } from "react";
import { AnalyticsAboutAppPageView } from "../src/firebase/analytics";

import { generateKeywordsString } from "../src/head-utils";
import AboutUs from "../components/about/AboutUs";
import LeaderboardsExample from "../components/about/LeaderboardsExample";

const keywords = generateKeywordsString(["coh3 stats", "coh3 discord", "bug report", "github"]);

const useStyles = createStyles((theme) => ({
  link: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },

  anchor: {
    display: "block",
    height: "65px",
    marginTop: "-65px",
    visibility: "hidden",
  },

  menu: {
    position: "sticky",
    top: "100px",
  },
}));

const sections = [
  { name: "aboutus", displayName: "About Us", component: <AboutUs /> },
  { name: "leaderboards", displayName: "Leaderboards", component: <LeaderboardsExample /> },
];

const About: NextPage = () => {
  useEffect(() => {
    AnalyticsAboutAppPageView();
  }, []);

  const { classes } = useStyles();

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
          <Grid>
            <Grid.Col span={4}>
              <div className={classes.menu}>
                {sections.map((x) => {
                  return (
                    <Flex
                      key={x.name}
                      direction={{ base: "column" }}
                      gap={{ base: "sm", sm: "lg" }}
                    >
                      <div>
                        <Anchor href={`#${x.name}`} className={classes.link}>
                          {x.displayName}
                        </Anchor>
                        <Divider my="sm" />
                      </div>
                    </Flex>
                  );
                })}
              </div>
            </Grid.Col>

            <Grid.Col span={8}>
              {sections.map((x, idx) => {
                return (
                  <>
                    <span className={classes.anchor} id={x.name} />
                    <Title size="h3" mb="lg">
                      {x.displayName}
                    </Title>
                    {x.component}
                    {idx !== sections.length - 1 && <Divider my="sm" />}
                  </>
                );
              })}
            </Grid.Col>
          </Grid>
        </Container>
      </>
    </div>
  );
};

export default About;
