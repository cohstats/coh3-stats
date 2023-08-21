import { NextPage } from "next";
import Head from "next/head";

import { Container, Text, Title, Anchor, Code, Spoiler } from "@mantine/core";

import React, { useEffect } from "react";
import config from "../../config";
import { AnalyticsOpenDataPageView } from "../../src/firebase/analytics";

const codeForLeaderboards = `https://storage.coh3stats.com/leaderboards/{unixTimeStamp}/{unixTimeStamp}_{mode}_{faction}.json

// Available modes: 1v1, 2v2, 3v3, 4v4
// Available factions: american, british, german, dak
// UnixTimeStamp: See explanation below how to calculate it

// Example:
https://storage.coh3stats.com/leaderboards/1683676800/1683676800_2v2_american.json
`;

const codeForForMatchData = `https://storage.coh3stats.com/matches/matches-{unixTimeStamp}.json

// UnixTimeStamp: See explanation below how to calculate it

// Example:
https://storage.coh3stats.com/matches/matches-1688169600.json
`;

const codeForUnixTimeStamp = `const date = new Date();
const timeStamp = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0) / 1000;
`;

const codeTypeOfLeaderBoards = `// Leaderboard json object definition:
{ "leaderboards": Array<RawLeaderboardStat>; }

type RawLeaderboardStat = {
  statgroup_id: number;
  leaderboard_id: number;
  wins: number;
  losses: number;
  streak: number;
  disputes?: number;
  drops?: number;
  rank: number;
  ranktotal?: number;
  regionrank?: number;
  regionranktotal?: number;
  ranklevel: number;
  rating: number;
  lastmatchdate: number;
  members: Array<RawPlayerProfile>;
};

type RawPlayerProfile = {
  profile_id: number;
  name: string;
  alias: string;
  personal_statgroup_id?: number;
  xp?: number;
  level: number;
  leaderboardregion_id?: number;
  country: string;
};
`;

const codeTypeOfMatchData = `// Match data json object definition:
{ "matches": Array<ProcessedMatch>; }

interface ProcessedMatch {
  id: number;
  creator_profile_id: number;
  mapname: string;
  maxplayers: number;
  matchtype_id: number;
  description: string;
  platform: string;
  startgametime: number;
  completiontime: number;
  matchhistoryreportresults: Array<PlayerReport>;
  matchhistoryitems: Array<ProcessedMatchHistoryItem>; // we are filtering out some items - those are cosmetic items
  profile_ids: Array<number>;
}

interface PlayerReport {
  profile_id: number;
  resulttype: number;
  teamid: number;
  race_id: number;
  counters: string;
  profile: ProcessedProfile;
  matchhistorymember: ProcessedMatchHistoryMember;
}

interface ProcessedProfile {
  name: string;
  alias: string;
  personal_statgroup_id: number;
  xp: number;
  level: number;
  leaderboardregion_id: number;
  country: string;
}

interface ProcessedMatchHistoryMember {
  statgroup_id: number;
  wins: number;
  losses: number;
  streak: number;
  arbitration: number;
  outcome: number;
  oldrating: number;
  newrating: number;
  reporttype: number;
}

interface ProcessedMatchHistoryItem {
  profile_id: number;
  itemdefinition_id: number;
  itemlocation_id: number;
}

// Check https://github.com/cohstats/coh3-stats/blob/master/src/coh3/coh3-raw-data.ts for additional details
`;

/**
 * This is example page you can find it by going on ur /example
 * @constructor
 */
const About: NextPage = () => {
  useEffect(() => {
    AnalyticsOpenDataPageView();
  }, []);

  return (
    <div>
      {/*This is custom HEAD overwrites the default one*/}
      <Head>
        <title>COH3 Stats - Open Data</title>
        <meta
          name="description"
          content="COH3 Stats are open sourcing a leaderboards and match data. Find more details on the page how to download them."
        />
      </Head>
      <>
        <Container size={"md"}>
          <Title order={1} pt="md">
            COH3 Stats - Open Data
          </Title>
          <div>
            <Title order={2} pt="md">
              COH3 Leaderboards data
            </Title>
            <Text pt="md">
              COH3 Stats is storing all the historic leaderboards for COH3. You can download the
              .json files from our storage. Each JSON file contains full leaderboards (all ranks)
              for a given mode and faction.
            </Text>
            <Text pt="md">
              They are created every day at 04:00 UTC. Downloading for a given day at 05:00 UTC
              should be safe.
              <br />
              History starts on 10h of May 2023.
            </Text>
            <Text pt="md">
              You can download them our our storage: <br />
              <Code block>{codeForLeaderboards}</Code>
            </Text>
            <Text fs="italic" fz={"small"}>
              If you are going to use the data, please mention the source of the data. And also
              please share your project with us on our{" "}
              <Anchor href={config.DISCORD_INVITE_LINK} target={"_blank"}>
                Discord
              </Anchor>
              . We would love to help you with your project.
            </Text>

            <Text pt={"md"}>Type definitions for the data:</Text>
            <Spoiler maxHeight={120} showLabel="Show full details" hideLabel="Hide">
              <Code block>{codeTypeOfLeaderBoards}</Code>
              <Text fs="italic" fz={"small"}>
                Optional fields are marked with &quot;?&quot;. And will be most likely not present
                as they are not deemed important. However they are on the Relic API in case you
                need them. Reach out to us if you need any clarification.
              </Text>
            </Spoiler>
          </div>
          <div>
            <Title order={2} pt="xl">
              COH3 Match data
            </Title>
            <Text pt="md">
              COH3 Stats is storing played matches. It should include all games where at least 1
              player was ranked. It might also include some custom and other types of games. It
              should not include any broken games. Aka game 3v3, which had only 2 players on one
              side. It is recommended to filter the games based on matchtype_id. You can download
              the .json files from our storage. Each JSON file contains all games played for a
              given day which we were able to track.
            </Text>
            <Text pt="md">
              They are created every day at 06:00 UTC. Downloading for a given day at 07:00 UTC
              should be safe.
              <br />
              History starts on July 1st 2023.
            </Text>
            <Text pt="md">
              You can download them our our storage: <br />
              <Code block>{codeForForMatchData}</Code>
            </Text>
            <Text pt={"md"}>Type definitions for the data:</Text>
            <Spoiler maxHeight={120} showLabel="Show full details" hideLabel="Hide">
              <Code block>{codeTypeOfMatchData}</Code>
            </Spoiler>
            <Text fs="italic" fz={"small"}>
              If you are going to use the data, please mention the source of the data. And also
              please share your project with us on our{" "}
              <Anchor href={config.DISCORD_INVITE_LINK} target={"_blank"}>
                Discord
              </Anchor>
              . We would love to help you with your project.
            </Text>
          </div>
          <Title order={2} pt="xl">
            COH3 Stats - Unix TimeStamp
          </Title>
          <div>
            <Text pt={"md"}>
              COH3 Stats is using Unix TimeStamp to mark each day date with the time 00:00:00 UTC.
              <br />
              For example 1683676800 which is May 10 2023 00:00:00 GMT+0000.
            </Text>
            <Text pt={"md"}>
              In JavaScript you can get the timestamp for the current day with this code:
            </Text>
            <Code block>{codeForUnixTimeStamp}</Code>
          </div>

          <div>
            <Title order={2} pt="xl">
              COH3 Game data
            </Title>
            <Text pt={"md"}>
              You can find the game data (units, descriptions, etc.) in our Data repository on
              Github.
              <br />
              <Anchor href={"https://github.com/cohstats/coh3-data"} target={"_blank"}>
                https://github.com/cohstats/coh3-data
              </Anchor>
            </Text>
            <Text pt={"sm"}>
              You can find all our other open source projects on our Github organization page:
              <br />
              <Anchor href={"https://github.com/cohstats"} target={"_blank"}>
                https://github.com/cohstats
              </Anchor>
            </Text>
          </div>
        </Container>
      </>
    </div>
  );
};

export default About;
