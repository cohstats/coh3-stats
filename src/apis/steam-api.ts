import { logger } from "../logger";
import { getSteamNewsCategory, NewsCategory } from "../news/news-categories";

const baseUrl = "https://api.steampowered.com/";
const baseUrlProxied = "https://steam.coh3stats.com/";
const steamStoreBaseUrl = "https://store.steampowered.com/";

const COH3_STEAM_APP_ID = 1677280;

const steamImagesBaseUrl = "https://clan.cloudflare.steamstatic.com/images";

export type NewsItem = {
  gid: string;
  title: string;
  url?: string | null;
  author?: string;
  contents?: string;
  image: string | null;
  /** Display only the image on the homepage; the article title is unaffected. */
  imageOnly?: boolean;
  date?: number;
  category?: NewsCategory;
};

export type COH3SteamNewsType = {
  count: number;
  newsitems: NewsItem[];
  currentPage?: number;
  totalPages?: number;
};

const getNumberOfOnlinePlayersSteamUrl = (appId: number | string = COH3_STEAM_APP_ID) => {
  return encodeURI(
    `${baseUrlProxied}ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`,
  );
};

const getCOH3SteamNewsUrl = (count: number = 20) => {
  return encodeURI(
    `${baseUrl}ISteamNews/GetNewsForApp/v2/?appid=${COH3_STEAM_APP_ID}&feeds=steam_community_announcements&count=${count}`,
  );
};

// Max page size of the store events endpoint, each page is ~1MB.
const STEAM_EVENTS_PAGE_SIZE = 100;
// The event types are optional, a stalled events request must not hold up the news.
const STEAM_EVENTS_TIMEOUT_MS = 10 * 1000;

const getCOH3SteamEventsUrl = (offset: number, count: number = STEAM_EVENTS_PAGE_SIZE) => {
  return encodeURI(
    `${steamStoreBaseUrl}events/ajaxgetpartnereventspageable/?clan_accountid=0&appid=${COH3_STEAM_APP_ID}&offset=${offset}&count=${count}&l=english`,
  );
};

/**
 * GetNewsForApp doesn't return the post type, the store events endpoint does (`event_type`).
 * The ids differ between the two, so the events are keyed by the announcement post time,
 * which equals the news `date`. Returns null when the events can't be loaded.
 */
const getCOH3SteamEventTypes = async (count: number): Promise<Map<number, number> | null> => {
  const eventTypes = new Map<number, number>();
  const pages = Math.ceil(count / STEAM_EVENTS_PAGE_SIZE);

  try {
    const responses = await Promise.all(
      Array.from({ length: pages }, (_, page) =>
        fetch(getCOH3SteamEventsUrl(page * STEAM_EVENTS_PAGE_SIZE), {
          cache: "force-cache",
          next: { revalidate: 1800 },
          signal: AbortSignal.timeout(STEAM_EVENTS_TIMEOUT_MS),
        }).then((response) => response.json()),
      ),
    );

    for (const { success, events } of responses) {
      // An error body still parses, it must not count as "no event types".
      if (success !== 1 || !Array.isArray(events)) {
        throw new Error(`Steam events request failed, success: ${success}`);
      }
      for (const event of events) {
        const postTime = event.announcement_body?.posttime;
        if (typeof postTime === "number" && typeof event.event_type === "number") {
          eventTypes.set(postTime, event.event_type);
        }
      }
    }
  } catch (e) {
    logger.error(e);
    return null;
  }

  return eventTypes;
};

type FetchedCOH3SteamNews = {
  news: COH3SteamNewsType;
  /** False when the categories come from the tag fallback, because the events failed. */
  hasEventTypes: boolean;
};

const fetchCOH3SteamNews = async (count: number): Promise<FetchedCOH3SteamNews> => {
  try {
    const [response, eventTypes] = await Promise.all([
      fetch(getCOH3SteamNewsUrl(count), {
        cache: "force-cache",
        next: { revalidate: 1800 },
      }),
      getCOH3SteamEventTypes(count),
    ]);
    const { appnews } = await response.json();

    delete appnews.appid;

    appnews.newsitems = appnews.newsitems.map((news: any) => {
      delete news.is_external_url;
      delete news.feedlabel;
      delete news.feedname;
      delete news.feed_type;
      delete news.appid;

      news.category = getSteamNewsCategory(eventTypes?.get(news.date), news.tags);
      delete news.tags;

      news.contents = news.contents.replaceAll("{STEAM_CLAN_IMAGE}", steamImagesBaseUrl);
      // console.log(JSON.stringify(news.contents))
      // news.contents = news.contents.replaceAll(/\n/g, "[br]");

      // news.contents = news.contents.replaceAll(/(?:[^\]])\s*(\n{1,3})/g, "[br]");
      // news.contents = news.contents.replaceAll("][br]", "");
      // console.log(JSON.stringify(news.contents))
      news.image = news.contents.match(/\[img\](.*?)\[\/img\]/)?.[1] ?? null;
      // There is possible new syntax for the image tag
      if (!news.image) {
        news.image = news.contents.match(/\[img src="(.*?)"\]/)?.[1] ?? null;
      }

      return news;
    });

    return { news: appnews, hasEventTypes: eventTypes !== null };
  } catch (e) {
    logger.error(e);
    return { news: { count: 0, newsitems: [] }, hasEventTypes: false };
  }
};

// The fetch `revalidate` option is ignored in the Pages Router, so without this every
// /news render called Steam (~2 MB of JSON). Kept per process, keyed by count.
const STEAM_NEWS_CACHE_TTL_MS = 30 * 60 * 1000;
// News with fallback categories is kept briefly, so the categories come back soon.
const STEAM_NEWS_WITHOUT_EVENT_TYPES_TTL_MS = 60 * 1000;
const steamNewsCache = new Map<number, { expiresAt: number; news: Promise<COH3SteamNewsType> }>();

const getCOH3SteamNews = (count = 100): Promise<COH3SteamNewsType> => {
  const cached = steamNewsCache.get(count);
  if (cached && cached.expiresAt > Date.now()) return cached.news;

  // Cache the promise, so concurrent requests share one Steam fetch.
  const entry = {
    expiresAt: Date.now() + STEAM_NEWS_CACHE_TTL_MS,
    news: fetchCOH3SteamNews(count).then(({ news, hasEventTypes }) => {
      // A newer fetch may have replaced this entry in the meantime.
      if (steamNewsCache.get(count) === entry) {
        // Don't keep a failed fetch for the whole TTL, retry on the next request.
        if (news.newsitems.length === 0) {
          steamNewsCache.delete(count);
        } else if (!hasEventTypes) {
          entry.expiresAt = Date.now() + STEAM_NEWS_WITHOUT_EVENT_TYPES_TTL_MS;
        }
      }
      return news;
    }),
  };
  steamNewsCache.set(count, entry);
  return entry.news;
};

/** For tests. */
const clearCOH3SteamNewsCache = () => steamNewsCache.clear();

export { getNumberOfOnlinePlayersSteamUrl, getCOH3SteamNews, clearCOH3SteamNewsCache };
