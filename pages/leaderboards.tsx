import { getLeaderBoardData } from "../src/coh3/coh3-api";
import { findAndMergeStatGroups } from "../src/coh3/helpers";
import { GetServerSideProps } from "next";
import { z } from "zod";
import { raceTypeArray, leaderBoardTypeArray } from "../src/coh3/coh3-types";
import { leaderboardRegions } from "../src/coh3/coh3-data";

import Leaderboards from "../screens/leaderboards/leaderboards";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Define the valid values for validation
const validRaces = raceTypeArray;
const validLeaderboardTypes = leaderBoardTypeArray;
const validPlatforms = ["steam", "xbox", "psn"] as const;
const validSortBy = ["wins", "elo"] as const;
const validRegions = Object.keys(leaderboardRegions) as Array<keyof typeof leaderboardRegions>;

// ZOD validation schema for leaderboards query
const leaderboardsQuerySchema = z.object({
  race: z
    .enum(validRaces)
    .optional()
    .default("american")
    .describe("The faction/race to display on the leaderboard"),

  type: z
    .enum(validLeaderboardTypes)
    .optional()
    .default("1v1")
    .describe("The game type (1v1, 2v2, 3v3, 4v4)"),

  platform: z.enum(validPlatforms).optional().default("steam").describe("The gaming platform"),

  sortBy: z
    .enum(validSortBy)
    .optional()
    .default("elo")
    .describe("Sort leaderboard by wins or elo"),

  start: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 1;
      const num = Number(val);
      return isNaN(num) || num < 1 ? 1 : Math.floor(num);
    })
    .describe("Starting position for pagination (must be positive integer)"),

  region: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return null;
      if (validRegions.includes(val as any)) {
        return val as keyof typeof leaderboardRegions;
      }
      return null;
    })
    .describe("Leaderboard region filter"),
});

// Helper function to convert sortBy string to sortById number
const getSortByIdFromString = (sortBy: "wins" | "elo"): number => {
  const sortById = {
    wins: 0,
    elo: 1,
  };
  return sortById[sortBy];
};

export const getServerSideProps: GetServerSideProps = async ({ query, res, locale = "en" }) => {
  // Validate and parse query parameters using ZOD safeParse
  const validationResult = leaderboardsQuerySchema.safeParse(query);

  if (!validationResult.success) {
    console.warn("Leaderboards validation error:", validationResult.error.issues);

    res.statusCode = 400;

    // Return error page or redirect to default leaderboards
    return {
      props: {
        leaderBoardData: null,
        error: "Invalid query parameters",
        start: 1,
        totalRecords: 0,
        raceToFetch: "american",
        typeToFetch: "1v1",
        platformToFetch: "steam",
        regionToFetch: null,
        ...(await serverSideTranslations(locale, ["common", "leaderboards"])),
      },
    };
  }

  const {
    race: raceToFetch,
    type: typeToFetch,
    platform: platformToFetch,
    sortBy,
    start: startToFetch,
    region: regionToFetch,
  } = validationResult.data;

  const sortByToFetch = getSortByIdFromString(sortBy);

  console.log(
    `SSR - /leaderboards, race: ${raceToFetch}, type: ${typeToFetch}, platform: ${platformToFetch}, region: ${regionToFetch}, sortBy: ${sortBy}, start: ${startToFetch}, locale: ${locale}`,
  );

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
    console.error(`Error getting the leaderboards for validated params:`, {
      race: raceToFetch,
      type: typeToFetch,
      platform: platformToFetch,
      region: regionToFetch,
      sortBy,
      start: startToFetch,
    });
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
      ...(await serverSideTranslations(locale, ["common", "leaderboards"])),
    }, // will be passed to the page component as props
  };
};

export default Leaderboards;
