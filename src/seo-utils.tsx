import { NextSeoProps } from "next-seo";
import { TFunction } from "next-i18next";
import React from "react";
import nextI18NextConfig from "../next-i18next.config";
import config from "../config";

// Default keywords for SEO
const _defaultKeywords = [
  "coh3",
  "coh3stats",
  "coh3 statistics",
  "coh3 info",
  "coh3 data",
  "Company of Heroes 3",
];

/**
 * Generate keywords for the <HEAD> tag
 * @param keywords Try not to pass more than 5 tags
 */
export const generateKeywordsString = (keywords: string[] = []) => {
  return keywords.concat(_defaultKeywords).join(", ");
};

const SUPPORTED_LANGUAGES = nextI18NextConfig.i18n.locales;

/**
 * Generates alternate language link elements for SEO (legacy Head component)
 * @param currentPath - The current path (usually from Next.js router's asPath)
 * @returns Array of alternate language link elements
 */
export const generateAlternateLanguageLinks = (currentPath: string): React.ReactNode => {
  return (
    <>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${config.SITE_URL}${lang === nextI18NextConfig.i18n.defaultLocale ? "" : `/${lang}`}${currentPath}`}
        />
      ))}
      <link
        key="x-default"
        rel="alternate"
        hrefLang="x-default"
        href={`${config.SITE_URL}${currentPath}`}
      />
    </>
  );
};

/**
 * Generates language alternates for next-seo format
 * @param currentPath - The current path (usually from Next.js router's asPath)
 * @returns Array of language alternate objects for next-seo
 */
export const generateLanguageAlternates = (currentPath: string) => {
  const alternates = SUPPORTED_LANGUAGES.map((lang) => ({
    hrefLang: lang,
    href: `${config.SITE_URL}${lang === nextI18NextConfig.i18n.defaultLocale ? "" : `/${lang}`}${currentPath}`,
  }));

  // Add x-default
  alternates.push({
    hrefLang: "x-default",
    href: `${config.SITE_URL}${currentPath}`,
  });

  return alternates;
};

// Export default keywords for backward compatibility
export { _defaultKeywords };

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

  // Get keywords from translation
  let keywords: string[] = [];
  try {
    const translatedKeywords = t("players:meta.keywords", { returnObjects: true });
    if (Array.isArray(translatedKeywords)) {
      keywords = translatedKeywords as string[];
    }
  } catch (error) {
    keywords = ["player profile", "player statistics"];
  }

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

  // Get keywords from translation
  let keywords: string[] = [];
  try {
    const translatedKeywords = t("leaderboards:meta.keywords", { returnObjects: true });
    if (Array.isArray(translatedKeywords)) {
      keywords = translatedKeywords as string[];
    }
  } catch (error) {
    keywords = ["leaderboards", "rankings"];
  }

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
