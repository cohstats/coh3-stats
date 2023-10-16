import { GlobalAchievementsData } from "../../../src/coh3/coh3-types";
import { generateKeywordsString } from "../../../src/head-utils";
import Head from "next/head";
import { Container } from "@mantine/core";
import React from "react";
import ErrorCard from "../../../components/error-card";
import Achievement from "./achivement";

const pageTitle = `Game Stats & Charts - Company of Heroes 3`;
const description = `Global Achievements for Company of Heroes 3.`;
const metaKeywords = generateKeywordsString([
  `Achievements`,
  `Steam Achievements`,
  `coh3 achievements`,
]);

const GlobalAchievements = ({
  globalAchievements,
  error,
}: {
  globalAchievements: GlobalAchievementsData | null;
  error: string | null;
}) => {
  // debug
  console.log(globalAchievements);
  console.log("ERROR", error);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <Container size={"lg"}>
        {error ? (
          <ErrorCard
            title={"Error getting the global achievements"}
            body={JSON.stringify(error)}
          />
        ) : (
          <>
            {/*  IMPLEMENT IT HERE*/}
            <Achievement />
            {JSON.stringify(globalAchievements)}
          </>
        )}
      </Container>
    </>
  );
};

export default GlobalAchievements;
