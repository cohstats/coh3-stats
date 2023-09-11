import { NextPage } from "next";
import React, { useEffect } from "react";
import { AnalyticsPlayerExportPageView } from "../../src/firebase/analytics";
import Head from "next/head";
import { Anchor, Code, Container, Space, Text, Title } from "@mantine/core";
import { generateKeywordsString } from "../../src/head-utils";

const exampleOutput = `alias,relic_id,steam_id,1v1_axis_elo,1v1_allies_elo,german_1v1_rank,german_1v1_elo,german_1v1_total,american_1v1_rank,american_1v1_elo,american_1v1_total,dak_1v1_rank,dak_1v1_elo,dak_1v1_total,british_1v1_rank,british_1v1_elo,british_1v1_total
Isildur,3705,76561198018614046,1432,1475,-1,1432,23,-1,1307,14,-1,1417,13,-1,1475,34
Rei,871,76561198404414770,1547,1607,43,1547,106,33,1602,139,26,1510,76,-1,1607,87
jibber,6219,76561198090318538,1717,1679,10,1717,229,21,1657,187,-1,1594,232,-1,1679,100
Luvnest,108833,76561197982704567,1543,1634,45,1543,146,37,1593,101,67,1400,85,18,1634,97
elpern,61495,76561198019498694,1681,1717,-1,1681,139,-1,1699,178,-1,1611,100,-1,1717,156
IncaUna,1287,76561198152399446,1557,1691,-1,1557,24,-1,1218,5,-1,1510,46,-1,1691,157`;

const keywords = generateKeywordsString(["coh3 players", "export", "csv"]);

const PlayerExport: NextPage = () => {
  useEffect(() => {
    AnalyticsPlayerExportPageView();
  }, []);

  return (
    <>
      <Head>
        <title>COH3 Stats - Player Export in CSV</title>
        <meta
          name="description"
          content="COH3 Stats player export - export player leaderboards in CSV format."
        />
        <meta name="keywords" content={keywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <>
        <Container size={"md"}>
          <Title order={1} pt="md">
            COH3 Stats - Player Export in CSV
          </Title>
          <Title order={4} pt="md">
            API for tournament organizers.
          </Title>
          <Text pt="md">
            This API gives you access to players leaderboard stats in CSV format. Which you can
            easily import in Excel sheet.
          </Text>
          <Space />
          <Text pt="md">
            Export the data via this link:
            <Code
              block
            >{`https://coh3stats.com/api/playerExport?types=["1v1"]&profileIDs=[3705,871,6219,108833,61495,1287]`}</Code>
          </Text>
          <Text pt="md">
            Parameter <Code>types</Code> can be <Code>{`["1v1", "2v2", "3v3", "4v4"]`}</Code>.
            <br />
            Parameter <Code>profileIDs</Code> is an array of Relic profile IDs. You can find them
            on COH3 Stats player cards.
          </Text>
          <Space h={"xl"} />
          <Text>
            Example how to import the data into Google Sheets is{" "}
            <Anchor
              href={
                "https://docs.google.com/spreadsheets/d/1K3aEixDvrnEB_Xdvwjx_NsTRqsWv2Kp4-ZSGwxbY7c8/edit?usp=sharing"
              }
              target={"_blank"}
            >
              here
            </Anchor>
            .
          </Text>
          <Space />
          <Title order={4} pt="md">
            Example output:
          </Title>
          <Code block>{exampleOutput}</Code>

          <Space h={"xl"} />
          <Text>
            In case you need the data for your tournament in different format or you have any
            other questions, let us know on Discord.
          </Text>
          <Text fs="italic">
            Shout-out for coh3stats.com at your tournament would be awesome. Thank you
          </Text>
          <Space h={"xl"} />
          <Text>
            Please note that this API is designed for use in tournaments or with a limited number
            of players.
            <Text span fw={500}>
              {" "}
              It is not intended for programmatic use.
            </Text>{" "}
            For any API collaboration head over to our Discord.
          </Text>
        </Container>
      </>
    </>
  );
};

export default PlayerExport;
