import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getMatch } from "../../src/apis/coh3stats-api";
import { ProcessedMatch } from "../../src/coh3/coh3-types";
import ErrorCard from "../../components/error-card";
import { NextSeo } from "next-seo";
import { Center, Loader } from "@mantine/core";
import { createMatchSEO } from "../../src/seo-utils";
import MatchDetail from "./match-detail";
import { useTranslation } from "next-i18next";
import config from "../../config";

const MatchDetailRoot: NextPage = () => {
  const { t } = useTranslation(["common"]);
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
  }, [matchId, profileIDs]);

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

  // Create SEO props based on match data availability
  let seoProps;
  if (matchData) {
    seoProps = createMatchSEO(t, matchData);
  } else {
    // Default SEO for loading/error states
    seoProps = {
      title: "COH3 Match Details",
      description: "Company of Heroes 3 match details and replay information.",
      canonical: `${config.SITE_URL}/matches/${matchId}`,
      additionalMetaTags: [
        {
          name: "keywords",
          content: "coh3 match details, match replay, game analysis",
        },
      ],
    };
  }

  return (
    <>
      <NextSeo {...seoProps} />
      <div style={{ minHeight: 900 }}>{content}</div>
    </>
  );
};

export default MatchDetailRoot;
