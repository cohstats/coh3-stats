import { logger } from "../logger";

interface RedditPostType {
  title: string;
  upvotes: number;
  comments: number;
  author: string;
  image: string;
  created: number;
  permalink: string;
}

interface CacheEntry {
  data: RedditPostType[];
  timestamp: number;
  isUpdating: boolean;
}

// In-memory cache with 3-hour TTL (3 * 60 * 60 * 1000 ms)
const CACHE_TTL = 3 * 60 * 60 * 1000;
let cache: CacheEntry | null = null;

// Helper function to fetch fresh data from Reddit API
const fetchRedditPosts = async (numberOfPosts: number): Promise<RedditPostType[]> => {
  try {
    // https://www.reddit.com/r/CompanyOfHeroes/top.json?limit=100&t=week
    const response = await fetch("https://coh3stats.com/api/redditCF", {
      method: "GET",
    });

    if (!response.ok) {
      console.warn(`Error getting reddit posts: ${response.statusText}, ${response.status}`);
      return [];
    }

    const data = await response.json();

    return data.data.children
      .filter((post: any) => {
        return `${post.data.link_flair_text}`.includes("CoH3");
      })
      .slice(0, numberOfPosts)
      .map(({ data }: { data: any }) => {
        // we can't serialize undefined values

        return {
          title: data.title ?? null,
          upvotes: data.ups ?? null,
          comments: data.num_comments ?? null,
          author: data.author ?? null,
          created: data.created_utc ?? null,
          permalink: data.permalink ?? null,
          image:
            (() => {
              // This is gallery post on Reddit
              if (data.is_gallery && data.is_gallery == true) {
                return data.thumbnail ?? null;
              }

              // This is type of post link on Reddit
              if (data.post_hint === "link") {
                return data.thumbnail ?? null;
              }

              // This is when you link YouTube video
              if (data.post_hint === "rich:video") {
                return data.thumbnail ?? null;
              }

              // This is when you upload video to Reddit
              if (data.is_video && data.is_video == true) {
                return null;
              }

              return data.url_overridden_by_dest ?? null;
            })() || null,
        };
      });
  } catch (e) {
    logger.error(e);
    return [];
  }
};

// Main function with stale-while-revalidate caching
const getLatestCOH3RedditPosts = async (numberOfPosts = 10): Promise<RedditPostType[]> => {
  const now = Date.now();

  // If no cached data exists, fetch fresh data
  if (!cache) {
    const freshData = await fetchRedditPosts(numberOfPosts);
    cache = {
      data: freshData,
      timestamp: now,
      isUpdating: false,
    };
    logger.info(`Fetched fresh data from Reddit API ${freshData.length}`);
    return freshData;
  }

  const isExpired = now - cache.timestamp > CACHE_TTL;

  // If cache is still fresh, return cached data
  if (!isExpired) {
    logger.info(
      `Returned cached data from Reddit API ${cache.data.length} , cache timestamp: ${new Date(cache.timestamp).toISOString()}`,
    );
    return cache.data;
  }

  // Cache is expired - return stale data immediately and update in background
  if (!cache.isUpdating) {
    // Mark as updating to prevent multiple concurrent updates
    cache.isUpdating = true;

    // Update cache asynchronously in the background
    fetchRedditPosts(numberOfPosts)
      .then((freshData) => {
        cache = {
          data: freshData,
          timestamp: Date.now(),
          isUpdating: false,
        };
        logger.info(
          `Fetched fresh data from Reddit API ${freshData.length} , cache timestamp: ${new Date(cache.timestamp).toISOString()}`,
        );
      })
      .catch((error) => {
        logger.error(`Error fetching fresh data: ${error}`);
        // Reset updating flag on error so we can try again next time
        if (cache) {
          cache.isUpdating = false;
        }
      });
  }
  logger.info(
    `Returned stale data from Reddit API ${cache.data.length} , cache timestamp: ${new Date(cache.timestamp).toISOString()}`,
  );
  // Return stale data immediately
  return cache.data;
};

export type { RedditPostType };
export { getLatestCOH3RedditPosts };
