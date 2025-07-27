import { NextPage } from "next";
import React from "react";
import { generateKeywordsString } from "../../../src/seo-utils";
import Head from "next/head";
import StatsContainerSelector from "../stats-container-selector";

const pageTitle = `Game Maps Stats & Charts - Company of Heroes 3`;
const description =
  "Game Maps Stats for Company of Heroes 3. See winrate of each faction, mode, team compositions and much more for each map in the game.";
const keywords = generateKeywordsString([
  "coh3 winrate",
  "coh3 maps",
  "factions winrate",
  "analysis",
  "best map",
]);

const MapStats: NextPage = () => {
  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <>
        <StatsContainerSelector statsType={"mapStats"} />
      </>
    </div>
  );
};

export default MapStats;
