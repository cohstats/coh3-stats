/**
 * This is example page of getting the data from Firestore on server.
 */

import { NextPage } from "next";
import React from "react";

import { getTwitchStreams } from "../../src/coh3stats-api";

const TwitchExample: NextPage = ({ twitchStreams, error }: any) => {
  console.log(twitchStreams);
  return (
    <>
      <div>ERROR: {error}</div>
      <div>STREAMS DATA</div>
      <div>{JSON.stringify(twitchStreams)}</div>
    </>
  );
};

export async function getServerSideProps() {
  let error = null;
  let twitchStreams = null;

  try {
    twitchStreams = await getTwitchStreams();
  } catch (e: any) {
    console.error(`Failed getting data for twitch streams`);
    console.error(e);
    error = e.message;
  }

  return { props: { twitchStreams, error } };
}

export default TwitchExample;
