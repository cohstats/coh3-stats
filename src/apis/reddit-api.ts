import { logger } from "../logger";

interface RedditPostType {
  title: string;
  upvotes: number;
  author: string;
  image: string;
  created: number;
  permalink: string;
}

const getLatestCOH3RedditPosts = async (numberOfPosts = 10): Promise<RedditPostType[]> => {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/CompanyOfHeroes/top.json?limit=100&t=month`,
      {
        method: "GET",
        // We need to send custom user agent, otherwise we might get blocked by Reddit
        // Let's try our own user agent / in case it fails let's fake browser user agent
        headers: {
          "User-Agent": "coh3stats.com/1.0.0",
        },
      },
    );

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
      .map((post: any) => {
        // we can't serialize undefined values
        return {
          title: post.data.title ?? null,
          upvotes: post.data.ups ?? null,
          author: post.data.author ?? null,
          image: post.data.url_overridden_by_dest ?? null,
          created: post.data.created_utc ?? null,
          permalink: post.data.permalink ?? null,
        };
      });
  } catch (e) {
    logger.error(e);
    return [];
  }
};

export type { RedditPostType };
export { getLatestCOH3RedditPosts };
