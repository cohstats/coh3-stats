import { NextPage } from "next";
import Head from "next/head";

import {
  Container,
  Title,
  Center,
  Anchor,
  Grid,
  Flex,
  Divider,
  createStyles,
  Space,
  Text,
} from "@mantine/core";
import React, { useEffect } from "react";
import { AnalyticsAboutAppPageView } from "../../src/firebase/analytics";
import { generateKeywordsString } from "../../src/head-utils";
import AboutUs from "./AboutUs";
import DonateSection from "./DonateSection";
import Link from "next/link";
import config from "../../config";
import DataSection from "./DataSection";

const BugReports = () => {
  return (
    <>
      This is a community project. We rely on your feedback, reports and ideas. <br />
      You can report the things on our{" "}
      <Anchor
        href={config.DISCORD_INVITE_LINK}
        target="_blank"
        rel="noopener noreferrer nofollow"
        title={"Link to our discord channel"}
      >
        Discord
      </Anchor>{" "}
      or directly on
      <Anchor
        component={Link}
        href={"https://github.com/cohstats/coh3-stats/issues"}
        target={"_blank"}
      >
        {" "}
        GitHub
      </Anchor>
      <Space h={"xs"} />
      <Text>
        You can see the development{" "}
        <Anchor
          component={Link}
          href={"https://github.com/cohstats/coh3-stats/graphs/contributors"}
          target={"_blank"}
        >
          contributions on our GitHub
        </Anchor>
        .
      </Text>
    </>
  );
};

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
  { name: "aboutus", menuDisplayName: "About", pageDisplayName: "About", component: <AboutUs /> },
  {
    name: "bugreport",
    menuDisplayName: "Bug Reports",
    pageDisplayName: "Bug Reports, Feature Request and Contributions",
    component: <BugReports />,
  },
  {
    name: "data",
    menuDisplayName: "Data",
    pageDisplayName: "Data Sources",
    component: <DataSection />,
  },
  {
    name: "donate",
    menuDisplayName: "Donate",
    pageDisplayName: "Donate and support us",
    component: <DonateSection />,
  },
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
          <Title order={1} size="h1" pt="md" mb="md">
            FAQs
          </Title>
        </Center>
        <Container size={"lg"}>
          {" "}
          <Grid>
            <Grid.Col span={3}>
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
                          {x.menuDisplayName}
                        </Anchor>
                        <Divider my="sm" />
                      </div>
                    </Flex>
                  );
                })}
              </div>
            </Grid.Col>

            <Grid.Col span={9}>
              {sections.map((x, idx) => {
                return (
                  <div key={x.name}>
                    <span className={classes.anchor} id={x.name} />
                    <Title size="h3" mb="md">
                      {x.pageDisplayName}
                    </Title>
                    {x.component}
                    {idx !== sections.length - 1 && <Divider my="sm" />}
                  </div>
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
