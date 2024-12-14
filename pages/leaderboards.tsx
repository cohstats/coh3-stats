import { getLeaderBoardData } from "../src/coh3/coh3-api";
import { findAndMergeStatGroups } from "../src/coh3/helpers";
import { raceType, leaderBoardType, platformType } from "../src/coh3/coh3-types";
import { GetServerSideProps } from "next";
import { LeaderboardRegionTypes } from "../src/coh3/coh3-data";

import Leaderboards from "../screens/leaderboards/leaderboards";

const sortById = {
  wins: 0,
  elo: 1,
};

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  const { race, type, sortBy, start, platform, region } = query;

  const raceToFetch = (race as raceType) || "american";
  const typeToFetch = (type as leaderBoardType) || "1v1";
  const platformToFetch = (platform as platformType) || "steam";
  const sortByToFetch = sortById[sortBy as "wins" | "elo"] || 1;
  const regionToFetch = (region as LeaderboardRegionTypes) || null;

  console.log(
    `SSR - /leaderboards, race: ${raceToFetch}, type: ${typeToFetch}, platform: ${platformToFetch}, region: ${regionToFetch}`,
  );

  let startNumber: number | undefined;
  if (start) {
    const number = Number(start);
    if (!isNaN(number)) {
      startNumber = number;
    }
  }
  const startToFetch = startNumber || 1;

  let leaderBoardData = null;
  let error = null;
  let totalRecords = 1;

  try {
    const leaderBoardDataRaw = await getLeaderBoardData(
      raceToFetch,
      typeToFetch,
      sortByToFetch,
      100,
      startToFetch,
      platformToFetch,
      regionToFetch,
    );
    totalRecords = leaderBoardDataRaw.rankTotal;
    leaderBoardData = findAndMergeStatGroups(leaderBoardDataRaw, null);

    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=120");
  } catch (e: any) {
    console.error(`Error getting the leaderboards`);
    console.error(e);
    error = e.message;
  }

  return {
    props: {
      leaderBoardData,
      error,
      start: startToFetch,
      totalRecords,
      raceToFetch,
      typeToFetch,
      platformToFetch,
      regionToFetch,
    }, // will be passed to the page component as props
  };
};

export default Leaderboards;
