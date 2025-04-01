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

const Statistics = () => {
  return (
    <>
      <Title order={4}>Data</Title>
      <li>Tracking only "automatch" matches. Not custom games or AI games.</li>
      See Data source article bellow for more details.
      <Space h={"xs"} />
      <Title order={4}>ELO Filtering</Title>
      <li>
        You can filter by single ELO group like{" "}
        <Anchor
          target={"_blank"}
          href={"/stats/games?from=2024-05-02&to=2024-07-15&filters=stats-average-1400-1599"}
        >
          this
        </Anchor>
      </li>
      <li>
        You can filter by combining multiple ELO groups like{" "}
        <Anchor
          target={"_blank"}
          href={
            "/stats/games?from=2024-05-02&to=2024-07-15&filters=stats-limit-1600-9999%2Cstats-limit-1400-1599%2Cstats-limit-1250-1399"
          }
        >
          this
        </Anchor>
      </li>
      It's recommended to combine multiple ELO groups to get more data for you analysis. Keep in
      mind that you need thousands of games to get meaningful results.
      <Space h={"xs"} />
      <div style={{ paddingLeft: 25 }}>
        <Title order={5}>Average Group Filter</Title>
        <>
          <Text>Average ELO of all players fit in the specified group.</Text>
          <li>
            <Text c={"green"} span>
              Good
            </Text>{" "}
            - a lot of games can fit into the group.
          </li>
          <li>
            <Text c={"red"} span>
              {" "}
              Bad
            </Text>{" "}
            - the game might not be balanced, it can be team A 1100 ELO vs Team B 1600 ELO.
          </li>
          Formula:
          <Text style={{ fontStyle: "italic" }}>
            Sum ELO of all players in match divided by number of players.
          </Text>
        </>
        <Space h={"xs"} />
        <Title order={5}>Average Fair Matchup Filter</Title>
        <>
          <Text>
            Average ELO of all players fit in the specified group while the difference between the
            teams ELO is bellow 20%
          </Text>
          <li>
            <Text c={"green"} span>
              Good
            </Text>{" "}
            - provides balanced games with more games to analyze. Useful for 3v3 and 4v4
          </li>
          <li>
            <Text c={"red"} span>
              {" "}
              Bad
            </Text>{" "}
            - the team itself might not be balanced. Team A can have player with 1600 and 800 ELO
            resulting in the average ELO of 1200 of team A.
          </li>
          Formula:
          <Text style={{ fontStyle: "italic" }}>
            Calculate average ELO of team A and team B. The difference between the ELO of the team
            A and B is less than 20%.
          </Text>
        </>
        <Space h={"xs"} />
        <Title order={5}>Average Excluded Group</Title>
        <>
          <Text>
            Average ELO of all players fit in the specified group while the difference between the
            lowest ELO and highest ELO player is less then 400.
          </Text>
          <li>
            <Text c={"green"} span>
              Good
            </Text>{" "}
            - provides balanced games
          </li>
          <li>
            <Text c={"red"} span>
              {" "}
              Bad
            </Text>{" "}
            - less games can fit into this group. Very low matches in mode 3v3 and 4v4 can fit
            into this group.
          </li>
          Formula:
          <Text style={{ fontStyle: "italic" }}>
            Sum ELO of all players in match divided by number of players to get match ELO. The
            difference between the lowest ELO and highest ELO player is less then 400.
          </Text>
        </>
        <Space h={"xs"} />
        <Title order={5}>Limit Group</Title>
        <>
          <Text>
            Average ELO of all players fit in the specified group while the difference between the
            lowest ELO and highest ELO player is less then 400.
          </Text>
          <li>
            <Text c={"green"} span>
              Good
            </Text>{" "}
            - should provide the most balanced games
          </li>
          <li>
            <Text c={"red"} span>
              {" "}
              Bad
            </Text>{" "}
            - very low matches fit. Unusable for 3v3 and 4v4.
          </li>
          Formula:
          <Text style={{ fontStyle: "italic" }}>
            All players in the match has to fit into the specified group. The difference between
            the lowest ELO and highest ELO player is less then 400.
          </Text>
        </>
      </div>
    </>
  );
};

const Localization = () => {
  return (
    <>
      <Text>
        We welcome contributions to translate the website into different languages. We are
        planning to support all languages which you can find in the language selector. You can
        find our localization files on{" "}
        <Anchor
          href="https://github.com/cohstats/coh3-stats/tree/master/public/locales"
          target="_blank"
        >
          GitHub
        </Anchor>
        .
      </Text>
      <Space h={"xs"} />
      <Text fs="italic">
        Note that not all website pages are currently set up for translation. You can still
        contribute translations for specific pages by providing the list of texts - we'll
        implement them when the pages are ready.
      </Text>
      <Space h={"xs"} />
      <Text>You can submit translations (partial translations are welcome) through:</Text>
      <li>
        Creating a post in the feature request section on our{" "}
        <Anchor
          href={config.DISCORD_INVITE_LINK}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Discord
        </Anchor>
      </li>
      <li>
        Creating an{" "}
        <Anchor href="https://github.com/cohstats/coh3-stats/issues" target="_blank">
          Issue on GitHub
        </Anchor>
      </li>
      <li>
        Submitting a{" "}
        <Anchor href="https://github.com/cohstats/coh3-stats/pulls" target="_blank">
          Pull Request on GitHub
        </Anchor>
      </li>
      <Space h={"xs"} />
      <Text>
        If you have any questions about the translation process, feel free to ask on our{" "}
        <Anchor
          href={config.DISCORD_INVITE_LINK}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Discord
        </Anchor>
        .
      </Text>
    </>
  );
};

const keywords = generateKeywordsString(["coh3 stats", "coh3 discord", "bug report", "github"]);

const sections = [
  { name: "aboutus", menuDisplayName: "About", pageDisplayName: "About", component: <AboutUs /> },
  {
    name: "bugreport",
    menuDisplayName: "Bug Reports",
    pageDisplayName: "Bug Reports, Feature Request and Contributions",
    component: <BugReports />,
  },
  {
    name: "localization",
    menuDisplayName: "Localization",
    pageDisplayName: "Website Localization",
    component: <Localization />,
  },
  {
    name: "stats",
    menuDisplayName: "Statistics",
    pageDisplayName: "Game Statistics",
    component: <Statistics />,
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
              <div
                style={{
                  position: "sticky",
                  top: 150,
                  display: "block",
                  height: "auto",
                }}
              >
                {sections.map((x) => {
                  return (
                    <Flex
                      key={x.name}
                      direction={{ base: "column" }}
                      gap={{ base: "sm", sm: "lg" }}
                    >
                      <div>
                        <Anchor
                          href={`#${x.name}`}
                          style={{
                            color: "inherit",
                          }}
                        >
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
                    <span
                      style={{
                        display: "block",
                        height: "65px",
                        marginTop: "-65px",
                        visibility: "hidden",
                      }}
                      id={x.name}
                    />
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
