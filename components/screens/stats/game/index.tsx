import { NextPage } from "next";
import React from "react";
import { generateKeywordsString } from "../../../../src/head-utils";
import Head from "next/head";
import StatsContainerSelector from "../stats-container-selector";

const pageTitle = `Game Stats & Charts - Company of Heroes 3`;
const description =
  "Game Stats for Company of Heroes 3. See winrate of each faction / mode and much more.";
const keywords = generateKeywordsString([
  "coh3 winrate",
  "factions winrate",
  "analysis",
  "best faction",
]);

const GameStats: NextPage = () => {
  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <>
        <StatsContainerSelector statsType={"gameStats"} />
      </>
    </div>
  );
};

export default GameStats;
