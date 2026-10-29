/**
 * News categories used to filter the /news page.
 * Steam posts get theirs from the Steam event type, local posts set it in `data/local-news.ts`.
 * The order is the order of the filter buttons.
 */
export const NEWS_CATEGORIES = [
  "news",
  "patchNotes",
  "tournaments",
  "dlcAndOffers",
  "communityEvents",
  "coh3stats",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const isNewsCategory = (value: unknown): value is NewsCategory =>
  typeof value === "string" && (NEWS_CATEGORIES as readonly string[]).includes(value);

/**
 * Steam event types as returned by the store events endpoint (`event_type`).
 * Labels are the ones Steam shows as "Type" on the store news page.
 */
const STEAM_EVENT_TYPE_CATEGORIES: Record<number, NewsCategory> = {
  12: "patchNotes", // Small Update / Patch Notes
  13: "patchNotes", // Regular Update
  14: "patchNotes", // Major Update
  15: "dlcAndOffers", // DLC Release
  20: "dlcAndOffers", // Game Sale
  28: "news", // News
  31: "dlcAndOffers", // Free Trial (free weekends)
  34: "dlcAndOffers", // Cross Promotion
  35: "communityEvents", // In-Game Event
};

/**
 * Resolves the category of a Steam post. Falls back to the GetNewsForApp tags
 * when the event type is unknown (events endpoint failed or post not matched).
 */
export const getSteamNewsCategory = (eventType?: number, tags?: string[]): NewsCategory => {
  if (eventType !== undefined && STEAM_EVENT_TYPE_CATEGORIES[eventType]) {
    return STEAM_EVENT_TYPE_CATEGORIES[eventType];
  }
  return tags?.includes("patchnotes") ? "patchNotes" : "news";
};
