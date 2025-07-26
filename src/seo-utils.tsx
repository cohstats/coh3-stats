import { NextSeoProps } from "next-seo";
import { TFunction } from "next-i18next";
import { generateKeywordsString, generateLanguageAlternates } from "./head-utils";
import config from "../config";

/**
 * Creates SEO props for a standard page using translation keys
 * @param t - Translation function
 * @param namespace - Translation namespace (e.g., 'home', 'search')
 * @param path - Current page path for canonical URL and language alternates
 * @param dynamicData - Optional dynamic data for interpolation
 */
export const createPageSEO = (
  t: TFunction,
  namespace: string,
  path: string = "",
  dynamicData?: Record<string, string>,
): NextSeoProps => {
  const title = t(`${namespace}:meta.title`, dynamicData || {});
  const description = t(`${namespace}:meta.description`, dynamicData || {});

  // Get keywords from translation, fallback to empty array if not found
  let keywords: string[] = [];
  try {
    const translatedKeywords = t(`${namespace}:meta.keywords`, { returnObjects: true });
    if (
      Array.isArray(translatedKeywords) &&
      translatedKeywords.every((item) => typeof item === "string")
    ) {
      keywords = translatedKeywords as string[];
    }
  } catch (error) {
    // Keywords not found in translation, use empty array
    keywords = [];
  }

  const canonical = `${config.SITE_URL}${path}`;

  return {
    title,
    description,
    canonical,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [
        {
          url: `${config.SITE_URL}/logo/android-icon-192x192.png`,
          width: 192,
          height: 192,
          alt: "COH3 Stats logo",
        },
      ],
    },
    additionalMetaTags: [
      {
        name: "keywords",
        content: generateKeywordsString(keywords),
      },
    ],
    languageAlternates: generateLanguageAlternates(path),
  };
};

/**
 * Creates SEO props for player pages with dynamic player data
 * @param t - Translation function
 * @param playerData - Player data object
 * @param playerSummary - Player summary statistics
 * @param platform - Player platform (steam, xbox, psn)
 */
export const createPlayerSEO = (
  t: TFunction,
  playerData: any,
  playerSummary: any,
  platform: string,
): NextSeoProps => {
  const playerName = playerData.info.name;
  const profileId = playerData.info.profile_id;

  const title = t("players:meta.title", { name: playerName });
  const description = createPlayerDescription(playerData, playerSummary, t);
  const canonical = `${config.SITE_URL}/players/${profileId}`;

  // Generate player-specific keywords
  const keywords = [
    t("players:meta.keywords.stats", { name: playerName }),
    t("players:meta.keywords.matches", { name: playerName }),
    t("players:meta.keywords.cohStats", { name: playerName }),
  ];

  const seoProps: NextSeoProps = {
    title,
    description,
    canonical,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "profile",
    },
    additionalMetaTags: [
      {
        name: "keywords",
        content: generateKeywordsString(keywords),
      },
      {
        name: "robots",
        content: "nofollow",
      },
    ],
    languageAlternates: generateLanguageAlternates(`/players/${profileId}`),
  };

  // Add player avatar for Steam users
  if (platform === "steam" && playerData.steamData?.avatarmedium) {
    seoProps.openGraph!.images = [
      {
        url: playerData.steamData.avatarmedium,
        width: 184,
        height: 184,
        alt: `${playerName} Steam avatar`,
      },
    ];
  }

  return seoProps;
};

/**
 * Creates SEO props for leaderboard pages with dynamic faction/mode data
 * @param t - Translation function
 * @param faction - Faction name
 * @param mode - Game mode
 * @param platform - Platform
 * @param region - Region (optional)
 */
export const createLeaderboardSEO = (
  t: TFunction,
  faction: string,
  mode: string,
  platform: string = "steam",
  region?: string,
): NextSeoProps => {
  const title = t("leaderboards:meta.title", { faction, mode });
  const description = t("leaderboards:meta.description", { faction, mode });

  const keywords = [
    t("leaderboards:meta.keywords.faction", { faction }),
    t("leaderboards:meta.keywords.mode", { mode }),
    "competitive ladder",
    "rankings",
  ];

  // Build canonical URL with query parameters
  const queryParams = new URLSearchParams({
    race: faction,
    type: mode,
    platform,
    ...(region && { region }),
  });
  const canonical = `${config.SITE_URL}/leaderboards?${queryParams.toString()}`;

  return {
    title,
    description,
    canonical,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [
        {
          url: `${config.SITE_URL}/icons/general/${faction}.webp`,
          width: 64,
          height: 64,
          alt: `${faction} faction icon`,
        },
      ],
    },
    additionalMetaTags: [
      {
        name: "keywords",
        content: generateKeywordsString(keywords),
      },
    ],
    languageAlternates: generateLanguageAlternates("/leaderboards"),
  };
};

/**
 * Creates SEO props for match detail pages
 * @param t - Translation function
 * @param matchData - Match data object
 */
export const createMatchSEO = (t: TFunction, matchData: any): NextSeoProps => {
  const matchId = matchData.id;
  const mapName = matchData.mapname;
  const mode = matchData.matchtype_id;

  const title = t("matches:meta.title", { matchId, map: mapName, mode });
  const description = t("matches:meta.description", { matchId, map: mapName, mode });
  const canonical = `${config.SITE_URL}/matches/${matchId}`;

  return {
    title,
    description,
    canonical,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
    additionalMetaTags: [
      {
        name: "keywords",
        content: generateKeywordsString(["match details", "game replay", mapName]),
      },
    ],
    languageAlternates: generateLanguageAlternates(`/matches/${matchId}`),
  };
};

/**
 * Helper function to create player description from player data
 */
function createPlayerDescription(playerData: any, playerSummary: any, t: TFunction): string {
  // Use the existing createPlayerHeadDescription logic or fallback to translation
  try {
    return createPlayerHeadDescription(playerData, playerSummary);
  } catch (error) {
    return t("players:meta.description", {
      name: playerData.info.name,
    });
  }
}

/**
 * Helper function to create player description from player data
 * This should be implemented based on the existing logic from screens/players/index.tsx
 */
function createPlayerHeadDescription(playerData: any, playerSummary: any): string {
  // Basic implementation - this should be enhanced with actual player stats
  const name = playerData.info.name;
  const totalGames = playerSummary?.totalGames || 0;
  const winRate = playerSummary?.winRate || 0;

  return `${name}'s Company of Heroes 3 player profile with ${totalGames} games played and ${winRate}% win rate. View detailed statistics, match history, and faction performance.`;
}
