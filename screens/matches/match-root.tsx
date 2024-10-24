import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getMatch } from "../../src/apis/coh3stats-api";
import { ProcessedMatch } from "../../src/coh3/coh3-types";
import ErrorCard from "../../components/error-card";
import Head from "next/head";
import { Center, Loader } from "@mantine/core";
import { generateKeywordsString } from "../../src/head-utils";
import MatchDetail from "./match-detail";

const keywords = generateKeywordsString(["match details"]);

const MatchDetailRoot: NextPage = () => {
  const router = useRouter();
  const { matchId, profileIDs } = router.query;
  const [matchData, setMatchData] = useState<ProcessedMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  let content = <></>;

  useEffect(() => {
    (async () => {
      if (matchId) {
        try {
          setIsLoading(true);
          let parsedProfileIDs: string[] | undefined;

          if (typeof profileIDs === "string") {
            try {
              parsedProfileIDs = JSON.parse(profileIDs);
            } catch (e) {
              console.error("Error parsing profileIDs:", e);
            }
          }

          const data = await getMatch(matchId as string, parsedProfileIDs);
          setMatchData(data);
        } catch (err: any) {
          if (err.message.includes("Match not found")) {
            setMatchData(null);
            return;
          }

          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [matchId]);

  if (isLoading)
    content = (
      <Center maw={400} h={250} mx="auto">
        <Loader />
      </Center>
    );

  if (error) {
    content = (
      <Center maw={400} h={250} mx="auto">
        <ErrorCard title={"Error getting match data"} body={JSON.stringify(error)} />
      </Center>
    );
  }

  if (!matchData && !isLoading && !error) {
    content = (
      <Center maw={400} h={250} mx="auto">
        <h3>No match found</h3>
      </Center>
    );
  }

  if (matchData) {
    content = <MatchDetail matchData={matchData} />;
  }

  return (
    <>
      <Head>
        <title>COH3 Stats - Match Details</title>
        <meta name="description" content="COH3 Stats - match details" />
        <meta name="keywords" content={keywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <div style={{ minHeight: 900 }}>{content}</div>
    </>
  );
};

export default MatchDetailRoot;
